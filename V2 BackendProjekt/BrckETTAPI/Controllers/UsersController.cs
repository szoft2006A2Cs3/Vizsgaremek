using System.ComponentModel.DataAnnotations;
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
                Settings = ""
            };
            _context.Usersettings.Add(userSettings);
            await _context.SaveChangesAsync();

            //create connection if referenced schedule exists
            var scheduleUserConn = new Schedulesusersconn
            {
                UserId = user.UserId,
                ScheduleId = 1
            };
            _context.Schedulesusersconns.Add(scheduleUserConn);

            //create connection if referenced group exists
            var groupUserConn = new Groupuserconn
            {
                Permission = "user",
                UserId = user.UserId,
                GroupId = 1
            };
                _context.Groupuserconns.Add(groupUserConn);

            await _context.SaveChangesAsync();

            return Created($"CREATED", user);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Users.Update")]
        public async Task<IActionResult> Put(int id, Users user)
        {
            var olduser = await _context.Users.FirstOrDefaultAsync(p => p.UserId == id);
            if (olduser == null) return NotFound();
            olduser.UserId = user.UserId;
            olduser.UserName = user.UserName;
            olduser.Email = user.Email;
            olduser.DisplayName = user.DisplayName;
            olduser.Description = user.Description;
            //olduser.Password = user.Password;
            olduser.Password = PasswordHandler.HashPassword(user.Password);
            await _context.SaveChangesAsync();
            return Ok(olduser);

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
