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
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Schedules.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Schedules.Read")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool ext = false)
        {
            Schedules? schedules = null;
            if (ext)
            {
                // load the related Templates navigation property and find by schedule id
                schedules = await _context.Schedules
                            .Include(s => s.Templates)
                            .FirstOrDefaultAsync(p => p.ScheduleId == id);
            }
            else
            {
                schedules = await _context.Schedules.FirstOrDefaultAsync(p => p.ScheduleId == id);
            }
            if (schedules == null) return NotFound();
            return Ok(schedules);
        }

        [HttpPost]
        [Authorize(Policy = "Schedules.Create")]
        public async Task<IActionResult> Post(Schedules schedules)
        {
            _context.Schedules.Add(schedules);
            await _context.SaveChangesAsync();
            return CreatedAtAction("create", schedules);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Schedules.Update")]
        public async Task<IActionResult> Put(int id, Schedules schedules)
        {
            var oldSchedules = await _context.Schedules.FirstOrDefaultAsync(p => p.ScheduleId == id);
            if (oldSchedules == null) return NotFound();
            oldSchedules.TemplateId = schedules.TemplateId;
            oldSchedules.ScheduleInfo = schedules.ScheduleInfo;
            oldSchedules.ScheduleId = schedules.ScheduleId;
            await _context.SaveChangesAsync();
            return Ok(oldSchedules);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Schedules.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var schedules = await _context.Schedules.FirstOrDefaultAsync(p => p.ScheduleId == id);
            if (schedules == null) return NotFound();
            _context.Schedules.Remove(schedules);
            await _context.SaveChangesAsync();
            return Ok(schedules);
        }
    }
}
