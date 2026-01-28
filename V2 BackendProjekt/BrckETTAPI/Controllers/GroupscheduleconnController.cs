using BackendProjekt.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupscheduleconnController : ControllerBase
    {
        private Context _context;

        public GroupscheduleconnController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Groupscheduleconns);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Groupscheduleconn? groupScheduleConns = null;
            if (ext)
            {
                groupScheduleConns = _context.Groupscheduleconns
                            .Include("Groups")
                            .Include("Schedule")
                            .FirstOrDefault(p => p.GroupId == id);
            }
            else
            {
                groupScheduleConns = _context.Groupscheduleconns.FirstOrDefault(p => p.GroupId == id);
            }
            if (groupScheduleConns == null) return NotFound();
            return Ok(groupScheduleConns);
        }

        [HttpPost]
        public IActionResult Post(Groupscheduleconn groupScheduleConns)
        {
            _context.Groupscheduleconns.Add(groupScheduleConns);
            _context.SaveChanges();
            return CreatedAtAction("create", groupScheduleConns);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, Groupscheduleconn groupScheduleConns)
        {
            var oldgroupScheduleConns = _context.Groupscheduleconns.FirstOrDefault(p => p.GroupId == id);
            if (oldgroupScheduleConns == null) return NotFound();
            oldgroupScheduleConns.GroupId = groupScheduleConns.GroupId;
            oldgroupScheduleConns.ScheduleId = groupScheduleConns.ScheduleId;
            _context.SaveChanges();
            return Ok(oldgroupScheduleConns);

        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var groupScheduleConns = _context.Groupscheduleconns.FirstOrDefault(p => p.GroupId == id);
            if (groupScheduleConns == null) return NotFound();
            _context.Groupscheduleconns.Remove(groupScheduleConns);
            _context.SaveChanges();
            return Ok(groupScheduleConns);
        }
    }
}
