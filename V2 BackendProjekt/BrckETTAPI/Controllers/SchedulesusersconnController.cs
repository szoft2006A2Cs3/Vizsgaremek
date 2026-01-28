using BackendProjekt.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesusersconnController : ControllerBase
    {
        private Context _context;

        public SchedulesusersconnController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Schedulesusersconns);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Schedulesusersconn? schedulesusersconn = null;
            if (ext)
            {
                schedulesusersconn = _context.Schedulesusersconns
                            .Include("Schedules")
                            .Include("Users")
                            .FirstOrDefault(p => p.UserId == id);
            }
            else
            {
                schedulesusersconn = _context.Schedulesusersconns.FirstOrDefault(p => p.UserId == id);
            }
            if (schedulesusersconn == null) return NotFound();
            return Ok(schedulesusersconn);
        }

        [HttpPost]
        public IActionResult Post(Schedulesusersconn schedulesusersconn)
        {
            _context.Schedulesusersconns.Add(schedulesusersconn);
            _context.SaveChanges();
            return CreatedAtAction("create", schedulesusersconn);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, Schedulesusersconn schedulesusersconn)
        {
            var oldschedulesusersconn = _context.Schedulesusersconns.FirstOrDefault(p => p.UserId == id);
            if (oldschedulesusersconn == null) return NotFound();
            oldschedulesusersconn.UserId = schedulesusersconn.UserId;
            oldschedulesusersconn.ScheduleId = schedulesusersconn.ScheduleId;
            _context.SaveChanges();
            return Ok(oldschedulesusersconn);

        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var schedulesusersconn = _context.Schedulesusersconns.FirstOrDefault(p => p.UserId == id);
            if (schedulesusersconn == null) return NotFound();
            _context.Schedulesusersconns.Remove(schedulesusersconn);
            _context.SaveChanges();
            return Ok(schedulesusersconn);
        }
    }
}
