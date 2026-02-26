using BackendProjekt.Auth;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace BackendProjekt.Controllers
{
    [ApiController]
    [Route("api/login")]
    public class LoginController : ControllerBase
    {
        private Context _context;
        private readonly TokenManager _tokenManager;

        // A tokenManager objektum azért elérhető itt, mert a program.cs-ben az AddSingleton() metódussal
        // felvettük az API szolgáltatásai közé. Az EntityFramework miatt kicsit eltérően, speciálisabban
        // kellett felvennünk a Context objektumot, amely az adatbázis kontextusunkat írja le.
        public LoginController(Context context, TokenManager tokenManager)
        {
            _context = context;
            _tokenManager = tokenManager;
        }

        public class LoginRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginReq)
        {
            // A bejelentkezés első lépése az azonosító, itt email cím alapján a felhasználó lekérdezése.
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginReq.Email);
            // Ha a felhasználó nem létezik, vagy a jelszó nem helyes a válasz "401-Unauthorize" lesz.
            // Nem logikus, hogy a hibás azonosítás vagy hitelesítés, azaz autentikációra miért "Unauthorized"
            // a válasz. Az authorization hiba már a logikusabb "403-Forbidden" választ adja.
            // A jelszó ellenőrzése a VerifyPassword segédfüggvényben lényegében úgy zajlik, hogy kódolja a
            // bejövő jelszót (password) és ennek az eredményét veti össze felhsználó adatbázisban tárolt
            // kódolt jelszavával.
            if (user == null || !PasswordHandler.VerifyPassword(loginReq.Password, user.Password)) return Unauthorized();
            // Siker esetén egy tokent generálunk, amely a felhasználó azonosítóját (email) és a szerepköréhez
            // (role) tartozó jogosultságokat (permission) mint állításokat (claim) tartalmazza.
            var token = _tokenManager.GenerateToken(user);
            // A tokent az őt használó User entitásba is beírjuk, hogy a kijelentkezésnél érvényteleníthessük.
            user.Token = token;
            await _context.SaveChangesAsync();
            //Console.WriteLine(_context.Users.FirstOrDefault(u => u.Email == loginReq.Email).Token);
            return Ok(token);
        }



        // Az alábbi Authorize címke azt közli, hogy bármilyen szabályzással elérhető ez a végpont. Ez itt azért helyes,
        // mert a kijelentkezésnek egy feltétele van: a felhasználó hitelesített, azaz korábban bejelentkezett és érvényes
        // tokent küldött. Az érvényesség feltétele itt az, hogy a token nem járt még le (exp) és az aláírása (signature)
        // is érvényes.
        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // Egy gyenge pontja a RESTful API-nak a token érvénytelenítése. Ugyanis ahhoz, hogy a kijelentkezés után
            // érvénytelenné váló tokeneket az API felismerje, ezeket valahol tárolni kell. Azaz a kliens állapotáról kell
            // adatot tárolni, ez pedig ellentmond a REST elveknek.
            // A LoginController.User csak olvasható attribútum tartalmazza a klienset leíró összes állítást (claim).
            // Ezeket a token hordozza, és helyes autentikáció esetén a keretrendszer olvassa ki és adja át a User objektumnak.
            // Keressük ki tehát az email címet az állítások közül!
            var email = User.FindFirst(ClaimTypes.Name)?.Value;
            // Ha a token nem tartalmazza az email címet, akkor érvénytelen és Unauthorized választ kell visszaadni!
            if (string.IsNullOrEmpty(email)) return Unauthorized();
            // Az email cím alapján keressük ki a felhasználót.
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            // Ha a felhasználó nem létezik, akkor a token érvénytelen volt és Unauthorized választ kell visszaadni!
            if (user == null) return Unauthorized();
            // Töröljük a tokent a felhasználónál.
            user.Token = null;
            // Az adatbázisba is elmentjük ezt a változást.
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{token}")]
        [Authorize(Policy = "Login.Put")]
        public async Task<IActionResult> ChangePassword(string token, [FromBody] ChangePasswordRequest req)
        {
            if (req == null) return BadRequest("Request body is required.");
            if (string.IsNullOrWhiteSpace(req.CurrentPassword) || string.IsNullOrWhiteSpace(req.NewPassword))
                return BadRequest("Both current and new passwords are required.");

            var email = TokenManager.GetEmailFromToken(token);
            if(email == null) return BadRequest("Invalid token: email claim not found.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return NotFound();

            if (!PasswordHandler.VerifyPassword(req.CurrentPassword, user.Password))
                return BadRequest("Current password is incorrect.");

            user.Password = PasswordHandler.HashPassword(req.NewPassword);

            // Invalidate stored token so client must re-authenticate (optional but recommended)
            //user.Token = null;

            await _context.SaveChangesAsync();
            return Ok("Password Succesfully Updated");
        }
    }
}
