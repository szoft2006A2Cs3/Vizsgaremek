using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulesController : ControllerBase
    {
        private Context _context;

        public SchedulesController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "Schedules.Read")]
        public IActionResult Get()
        {
            return Ok(_context.Schedules);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Schedules.Read")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Schedules? schedules = null;
            if (ext)
            {
                schedules = _context.Schedules
                            .Include(k => k.TemplateId) 
                            .FirstOrDefault(p => p.TemplateId == id);
            }
            else
            {
                schedules = _context.Schedules.FirstOrDefault(p => p.TemplateId == id);
            }
            if (schedules == null) return NotFound();
            return Ok(schedules);
        }

        [HttpPost]
        [Authorize(Policy = "Schedules.Create")]
        public IActionResult Post(Schedules schedules)
        {
            _context.Schedules.Add(schedules);
            _context.SaveChanges();
            return CreatedAtAction("create", schedules);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Schedules.Update")]
        public IActionResult Put(int id, Schedules schedules)
        {
            var oldSchedules = _context.Schedules.FirstOrDefault(p => p.TemplateId == id);
            if (oldSchedules == null) return NotFound();
            oldSchedules.TemplateId = schedules.TemplateId;
            oldSchedules.ScheduleInfo = schedules.ScheduleInfo;
            oldSchedules.ScheduleId = schedules.ScheduleId;
            _context.SaveChanges();
            return Ok(oldSchedules);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Schedules.Delete")]
        public IActionResult Delete(int id)
        {
            var schedules = _context.Schedules.FirstOrDefault(p => p.TemplateId == id);
            if (schedules == null) return NotFound();
            _context.Schedules.Remove(schedules);
            _context.SaveChanges();
            return Ok(schedules);
        }
    }
}
