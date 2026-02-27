using BackendProjekt.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ZstdSharp.Unsafe;

namespace BackendProjekt.Auth
{
    // A TokenManager fő feladata a token és a jogosultságok kezelése.
    public class TokenManager
    {
        // A token ellenőrzéséhez szükséges 3 adat, melyeket a konfigurációból olvasunk ki
        // a konstruktorban. Ezek azért nem statikus adatok, mert az API a TokenManager
        // osztályból csak egyetlen egy példányt hoz létre (lásd az AddSingleton() metódust).
        private string _secretKey = string.Empty;
        private string _issuer = string.Empty;
        private string _audience = string.Empty;
        // A szótár a szerepköröket és a jogosultságok listáját tárolja. Ezeket a konstruktorban
        // a konfigurációból olvassa ki.
        private Dictionary<string, List<string>> _rolesPermissions = [];

        // A jogosultságok listáját kívülről is olvasnunk kell: a program.cs AddJwtAuthentication
        // metódusban a josogultságokból szabályokat (policy) hozunk létre.
        public List<string> Permissions {
            get
            {
                var permissions = new List<string>();
                foreach (var values in _rolesPermissions.Values)
                {
                    permissions.AddRange(values);
                }
                return permissions;
            }
        }

        public TokenManager(ConfigurationManager configuration)
        {
            // Kiolvassuk a 3 adatot a konfigurációból (appsettings.json)
            _secretKey = configuration["Auth:JWT:Key"]!;
            _issuer = configuration["Auth:JWT:Issuer"]!;
            _audience = configuration["Auth:JWT:Audience"]!;

            // Feltöltjük a szerepkör-jogosultságok összerendelést, így a felhasználó a szerepkörének
            // megfelelő jogosultságokat kapja meg a token generálásakor.
            foreach (var role in configuration.GetSection("Auth:Roles")?.GetChildren() ?? [])
            {
                foreach (var permission in role.GetChildren())
                {
                    if (!string.IsNullOrEmpty(permission.Value))
                    {
                        if (!_rolesPermissions.TryGetValue(role.Key, out var permissionList))
                        {
                            permissionList = [];
                            _rolesPermissions.Add(role.Key, permissionList);
                        }
                        permissionList.Add(permission.Value);
                    }
                }
            }
        }

        // A token generálásához szükséges a felhasználó adatai közül
        // - az email címe,
        // - a szerepköre.
        // Az ezekből létrehozott állításokat (claim) a tokenbe tároljuk.
        public string GenerateToken(Users user)
        {
            var claims = new List<Claim>
            {
                // Az email címet mint a felhasználó "nevét" tároljuk el.
                new (ClaimTypes.Name, user.Email)
            };
            foreach (var permission in _rolesPermissions[user.Role!])
            {
                // A felhasználó szerepköréhez tartozó jogosultságokat mint "engedélyeket"
                // tároljuk el.
                claims.Add(new Claim("permission", permission));
            }

            // A token aláírása a titkos kulcsból létrehozott "credentials" adatokkal történik.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // A token tartalmazza
            var token = new JwtSecurityToken(
                // a kibocsátót,
                issuer: _issuer,
                // a célközönséget,
                audience: _audience,
                // a fent összegyűjtött állításokat,
                claims: claims,
                // a lejárat időpontját,
                expires: DateTime.Now.AddHours(1),
                // és az aláíráshoz szükséges hitelesítési adatokat.
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }



        public static string GetEmailFromToken(string token) 
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return null;
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
                return null;
            }

            var email = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return null;
            }

            return email;
        }
    }
}