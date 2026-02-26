using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BackendProjekt.Auth;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private Context _context;

        public UsersController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "Users.Read")]
        public IActionResult Get()
        {
            return Ok(_context.Users);
        }

        [HttpGet("{input}")]
        [Authorize(Policy = "Users.Read")]
        public async Task<IActionResult> Get(string input, [FromQuery] bool ext = false)
        {
            if (!int.TryParse(input, out _) && input.IndexOf("@") == -1)
            {
                return BadRequest("Input must be a valid UserId or Email.");
            }


            Users? user = null;
            if (ext)
            {
                if (input.IndexOf("@") == -1)
                {
                    user = await _context.Users
                            //.Include("") 
                            .FirstOrDefaultAsync(p => p.UserId == int.Parse(input));
                }
                else 
                {
                    user = await _context.Users
                            //.Include("") 
                            .FirstOrDefaultAsync(p => p.Email == input);
                }
                
            }
            else
            {
                if (input.IndexOf("@") == -1)
                {
                    user = await _context.Users
                            .FirstOrDefaultAsync(p => p.UserId == int.Parse(input));
                }
                else
                {
                    user = await _context.Users
                            .FirstOrDefaultAsync(p => p.Email == input);
                }
            }
            if (user == null) return NotFound();
            return Ok(user);
        }

        //[HttpGet("{email}")]
        //[Authorize(Policy = "Users.Read")]
        //public IActionResult GetByEmail(string email, [FromQuery] bool ext = false)
        //{
        //    Users? user = null;
        //    if (ext)
        //    {
        //        user = _context.Users
        //                    //.Include("") 
        //                    .FirstOrDefault(p => p.Email == email);
        //    }
        //    else
        //    {
        //        user = _context.Users.FirstOrDefault(p => p.Email == email);
        //    }
        //    if (user == null) return NotFound();
        //    return Ok(user);
        //}



        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Post(Users user)
        {
            if (_context.Users.FirstOrDefault(u => u.Email == user.Email) != null)
            {
                return BadRequest("Ez az e-mail cím már tartozik egy fiókhoz");
            }

            user.Password = PasswordHandler.HashPassword(user.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create Usersettings with the same UserId
            var userSettings = new Usersettings
            {
                UserId = user.UserId,
                Settings = "dark-mode/false/month"
            };
            var template = new Templates
            {
                TemplateInfo = "Default Template"
            };
            var grptemplate = new Templates
            {
                TemplateInfo = "Default Group Template"
            };
            _context.Usersettings.Add(userSettings);
            _context.Templates.Add(template);
            _context.Templates.Add(grptemplate);
            await _context.SaveChangesAsync();

            var schedule = new Schedules
            {
                ScheduleInfo = "Default Schedule",
                TemplateId = template.TemplateId
            };
            var grpschedule = new Schedules
            {
                ScheduleInfo = "Default Group Schedule",
                TemplateId = grptemplate.TemplateId
            };
            var group = new Groups
            {
                GroupName = "Default Name"
            };
            _context.Schedules.Add(schedule);
            _context.Schedules.Add(grpschedule);
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            //create connection if referenced schedule 
            var scheduleUserConn = new Schedulesusersconn
            {
                UserId = user.UserId,
                ScheduleId = schedule.ScheduleId,
            };
            

            //create connection if referenced group exists
            var groupUserConn = new Groupuserconn
            {
                Permission = "user",
                UserId = user.UserId,
                GroupId = group.GroupId
            };
            var groupScheduleConn = new Groupscheduleconn
            {
                GroupId = group.GroupId,
                ScheduleId = grpschedule.ScheduleId
            };
            _context.Schedulesusersconns.Add(scheduleUserConn);
            _context.Groupuserconns.Add(groupUserConn);
            _context.Groupscheduleconns.Add(groupScheduleConn);


            await _context.SaveChangesAsync();

            return Created($"CREATED", user);
        }

        [HttpPut("{token}")]
        [Authorize(Policy = "Users.Update")]
        public async Task<IActionResult> Put(string token, Users user)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) { return BadRequest("Invalid token."); }

            var olduser = await _context.Users.FirstOrDefaultAsync(p => p.Email == email);
            if (olduser == null) return NotFound();

            if (await _context.Users.FirstOrDefaultAsync(p => p.Email == user.Email) == null || email == user.Email)
            {
                olduser.UserName = user.UserName;
                olduser.Email = user.Email;
                olduser.DisplayName = user.DisplayName;
                olduser.Description = user.Description;
                //olduser.Password = user.Password;
                //olduser.Password = PasswordHandler.HashPassword(user.Password);
                await _context.SaveChangesAsync();
                return Ok(olduser);
            }
            else 
            {
                return BadRequest("This email is already in use by a diffrent user");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Users.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(p => p.UserId == id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }
    }
}
