using BackendProjekt.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleBlockController : ControllerBase
    {
        private Context _context;

        public ScheduleBlockController(Context context)
        {
            _context = context;
        }

        [Authorize(Policy = "ScheduleBlock.Read")]
        [HttpGet("{token}/{scheduleId}")]
        public async Task<IActionResult> Get(string token, int scheduleId)
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

            var email = jwt.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.Name ||
                c.Type == ClaimTypes.Email ||
                string.Equals(c.Type, "email", StringComparison.OrdinalIgnoreCase)
            )?.Value;

            if (string.IsNullOrEmpty(email)) 
            {
                return BadRequest("Email claim not found in token.");
            }
                



            var user = await _context.Users
                .Include(u => u.Schedulesusersconns)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return Unauthorized();
            }
            // Check user is connected to the requested schedule
            var hasConnection = user.Schedulesusersconns?.Any(su => su.ScheduleId == scheduleId) ?? false;
            

            // Check if the user is connected to a group that is connected to the requested schedule
            var hasGroupConnection = await _context.Groupuserconns
                .Include(gu => gu.Group)
                .ThenInclude(g => g.Groupscheduleconns)
                .AnyAsync(gu =>
                    gu.UserId == user.UserId &&
                    gu.Group.Groupscheduleconns.Any(gs => gs.ScheduleId == scheduleId)
                );
            if (!hasConnection && hasGroupConnection == null) 
            {
                return NotFound();
            }


            var schedule = await _context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
            if (schedule == null)
            {
                return NotFound();
            }

            var templateId = schedule.TemplateId;

            // Get blocks linked to the template via templatesBlocksConns
            var blocks = await _context.templatesBlocksConns
                .Include(tbc => tbc.Blocks)
                .Where(tbc => tbc.TemplateId == templateId)
                .Select(tbc => tbc.Blocks!)
                .ToListAsync();

            return Ok(blocks);
        }
    }
}
