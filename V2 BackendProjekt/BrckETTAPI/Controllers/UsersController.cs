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
        public IActionResult Get(string input, [FromQuery] bool ext = false)
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
                    user = _context.Users
                            //.Include("") 
                            .FirstOrDefault(p => p.UserId == int.Parse(input));
                }
                else 
                {
                    user = _context.Users
                            //.Include("") 
                            .FirstOrDefault(p => p.Email == input);
                }
                
            }
            else
            {
                if (input.IndexOf("@") == -1)
                {
                    user = _context.Users
                            .FirstOrDefault(p => p.UserId == int.Parse(input));
                }
                else
                {
                    user = _context.Users
                            .FirstOrDefault(p => p.Email == input);
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
        public IActionResult Post(Users user)
        {
            if (_context.Users.FirstOrDefault(u => u.Email == user.Email)!=null) 
            {
                return BadRequest("Ez az e-mail cím már tartozik egy fiókhoz");
            }


            user.Password = PasswordHandler.HashPassword(user.Password);
            _context.Users.Add(user);
            _context.SaveChanges();
            return Created($"CREATED", user);
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
            //olduser.Password = user.Password;
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
