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

        [HttpGet("{id}")]
        [Authorize(Policy = "Users.Read")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Users? user = null;
            if (ext)
            {
                user = _context.Users
                            //.Include("") 
                            .FirstOrDefault(p => p.UserId == id);
            }
            else
            {
                user = _context.Users.FirstOrDefault(p => p.UserId == id);
            }
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        [AllowAnonymous]
        public IActionResult Post(Users user)
        {
            user.Password = PasswordHandler.HashPassword(user.Password);
            _context.Users.Add(user);
            _context.SaveChanges();
            return CreatedAtAction("create", user);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Users.Update")]
        public IActionResult Put(int id, Users user)
        {
            var olduser = _context.Users.FirstOrDefault(p => p.UserId == id);
            if (olduser == null) return NotFound();
            olduser.UserId = user.UserId;
            olduser.UserName = user.UserName;
            olduser.Email = user.Email;
            olduser.DisplayName = user.DisplayName;
            olduser.Password = PasswordHandler.HashPassword(user.Password);
            _context.SaveChanges();
            return Ok(olduser);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Users.Delete")]
        public IActionResult Delete(int id)
        {
            var user = _context.Users.FirstOrDefault(p => p.UserId == id);
            if (user == null) return NotFound();
            _context.Users.Remove(user);
            _context.SaveChanges();
            return Ok(user);
        }
    }
}
