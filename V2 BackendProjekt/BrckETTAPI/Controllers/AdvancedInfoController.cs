using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata;
using System.Security.Claims;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// NOT IMPLEMENTED YET
    /// </summary>
    //------------------------------------------------------------------------------------------------------------------------
    public class AdvancedInfoController : ControllerBase
    {
        private Context _context;

        public AdvancedInfoController(Context context)
        {
            _context = context;
        }
        // GET: api/<AdvancedInfoController>

        [HttpGet]
        [Authorize(Policy = "AdvancedInfo.Read")]
        public async Task<IActionResult> Get()
        {
            return Ok("Not implemented yet");
        }

        // GET api/<AdvancedInfoController>/5
        [HttpGet("{token}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> Get(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest("Token is required.");

            // Accept "Bearer <token>" or raw token
            if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                token = token.Substring("Bearer ".Length).Trim();

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

            // TokenManager stores the email in ClaimTypes.Name (see TokenManager.GenerateToken)
            var email = jwt.Claims
                .FirstOrDefault(c =>
                    c.Type == ClaimTypes.Name ||
                    c.Type == ClaimTypes.Email ||
                    string.Equals(c.Type, "email", StringComparison.OrdinalIgnoreCase) ||
                    c.Type.EndsWith("/email", StringComparison.OrdinalIgnoreCase)
                )?.Value;

            if (string.IsNullOrEmpty(email))
                return BadRequest("Email claim not found in token.");

            var resp = await _context.Users
                .Include(u => u.Usersettings)
                .Include(u => u.Schedulesusersconns)
                    .ThenInclude(su => su.Schedules)
                        .ThenInclude(s => s.Templates)
                .Include(u => u.Groupuserconns)
                    .ThenInclude(gu => gu.Group)
                        .ThenInclude(g => g.Groupscheduleconns)
                            .ThenInclude(gs => gs.Schedule)
                                .ThenInclude(s => s.Templates)
                                    .FirstOrDefaultAsync(u => u.Email == email);

            if (resp == null) return NotFound();

            resp.Password = "";
            // Remove Groupscheduleconns from Schedules in Schedulesusersconns
            if (resp.Schedulesusersconns != null)
            {
                foreach (var su in resp.Schedulesusersconns)
                {
                    if (su.Schedules != null)
                    {
                        su.Schedules.Groupscheduleconns = null;
                    }
                }
            }
            // Remove Schedulesusersconns from Schedules in Groupscheduleconns (via Groups)
            if (resp.Groupuserconns != null)
            {
                foreach (var gu in resp.Groupuserconns)
                {
                    if (gu.Group?.Groupscheduleconns != null)
                    {
                        foreach (var gs in gu.Group.Groupscheduleconns)
                        {
                            if (gs.Schedule != null)
                            {
                                gs.Schedule.Schedulesusersconns = null;
                            }
                        }
                    }
                }
            }


            return Ok(resp);
        }

        // POST api/<AdvancedInfoController>
        [HttpPost]
        [Authorize(Policy = "AdvancedInfo.Create")]
        public async Task<IActionResult> Post([FromBody] string value)
        {
            return Ok("Not implemented yet");
        }

        // PUT api/<AdvancedInfoController>/5
        [Authorize(Policy = "AdvancedInfo.Update")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] string value)
        {
            return Ok("Not implemented yet");
        }

        // DELETE api/<AdvancedInfoController>/5
        [Authorize(Policy = "AdvancedInfo.Delete")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return Ok("Not implemented yet");
        }
    }
}
