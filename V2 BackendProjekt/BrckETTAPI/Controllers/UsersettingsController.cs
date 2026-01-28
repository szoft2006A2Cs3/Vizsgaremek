using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public IActionResult Get()
        {
            return Ok(_context.Usersettings);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "UserSettings.Read")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Usersettings? usersetting = null;
            if (ext)
            {
                usersetting = _context.Usersettings
                            .Include(k => k.UserId)
                            .FirstOrDefault(p => p.UserId == id);
            }
            else
            {
                usersetting = _context.Usersettings.FirstOrDefault(p => p.UserId == id);
            }
            if (usersetting == null) return NotFound();
            return Ok(usersetting);
        }

        [HttpPost]
        [Authorize(Policy = "UserSettings.Create")]

        public IActionResult Post(Usersettings usersetting)
        {
            _context.Usersettings.Add(usersetting);
            _context.SaveChanges();
            return CreatedAtAction("create", usersetting);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "UserSettings.Update")]
        public IActionResult Put(int id, Usersettings usersetting)
        {
            var oldusersetting = _context.Usersettings.FirstOrDefault(p => p.UserId == id);
            if (oldusersetting == null) return NotFound();
            oldusersetting.UserId = usersetting.UserId;
            oldusersetting.Settings = usersetting.Settings;
            _context.SaveChanges();
            return Ok(oldusersetting);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "UserSettings.Delete")]
        public IActionResult Delete(int id)
        {
            var usersetting = _context.Usersettings.FirstOrDefault(p => p.UserId == id);
            if (usersetting == null) return NotFound();
            _context.Usersettings.Remove(usersetting);
            _context.SaveChanges();
            return Ok(usersetting);
        }
    }
}
