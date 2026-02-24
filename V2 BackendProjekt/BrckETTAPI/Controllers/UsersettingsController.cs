using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersettingsController : ControllerBase
    {
        private Context _context;

        public UsersettingsController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "UserSettings.Read")]
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Usersettings.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "UserSettings.Read")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool ext = false)
        {
            Usersettings? usersetting = null;
            if (ext)
            {
                usersetting = await _context.Usersettings
                            .Include(k => k.UserId)
                            .FirstOrDefaultAsync(p => p.UserId == id);
            }
            else
            {
                usersetting = await _context.Usersettings.FirstOrDefaultAsync(p => p.UserId == id);
            }
            if (usersetting == null) return NotFound();
            return Ok(usersetting);
        }

        [HttpPost]
        [Authorize(Policy = "UserSettings.Create")]

        public async Task<IActionResult> Post(Usersettings usersetting)
        {
            _context.Usersettings.Add(usersetting);
            await _context.SaveChangesAsync();
            return CreatedAtAction($"created", usersetting);
        }

        [HttpPut("{token}")]
        [Authorize(Policy = "UserSettings.Update")]
        public async Task<IActionResult> Put(string token, Usersettings usersetting)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest("Token is required.");
            }


            if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                token = token.Substring("Bearer ".Length).Trim();
            }

            JwtSecurityToken jwt;
            try
            {
                var handler = new JwtSecurityTokenHandler();
                jwt = handler.ReadJwtToken(token);
            }
            catch (Exception)
            {
                return BadRequest("Invalid JWT format.");
            }

            var email = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email claim not found in token.");
            }


            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) 
            {
                return NotFound(); 
            }

            var oldusersetting = await _context.Usersettings.FirstOrDefaultAsync(p => p.UserId == user.UserId);
            if (oldusersetting == null) return NotFound();
            //oldusersetting.UserId = usersetting.UserId;
            oldusersetting.Settings = usersetting.Settings;
            await _context.SaveChangesAsync();
            return Ok(oldusersetting);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "UserSettings.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var usersetting = await _context.Usersettings.FirstOrDefaultAsync(p => p.UserId == id);
            if (usersetting == null) return NotFound();
            _context.Usersettings.Remove(usersetting);
            await _context.SaveChangesAsync();
            return Ok(usersetting);
        }
    }
}
