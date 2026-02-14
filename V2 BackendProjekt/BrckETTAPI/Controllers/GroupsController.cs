using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private Context _context;

        public GroupsController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "Groups.Read")]
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Groups.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Groups.Read")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool ext = false)
        {
            Groups? group = null;
            if (ext)
            {
                group = await _context.Groups
                            //.Include("") 
                            .FirstOrDefaultAsync(p => p.GroupId == id);
            }
            else
            {
                group = await _context.Groups.FirstOrDefaultAsync(p => p.GroupId == id);
            }
            if (group == null) return NotFound();
            return Ok(group);
        }

        [HttpPost]
        [Authorize(Policy = "Groups.Create")]
        public async Task<IActionResult> Post(Groups group)
        {
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return CreatedAtAction("create", group);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Groups.Update")]
        public async Task<IActionResult> Put(int id, Groups group)
        {
            var oldGroup = await _context.Groups.FirstOrDefaultAsync(p => p.GroupId == id);
            if (oldGroup == null) return NotFound();
            //oldGroup.GroupId = group.GroupId;
            oldGroup.GroupName = group.GroupName;
            await _context.SaveChangesAsync();
            return Ok(oldGroup);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Groups.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var group = await _context.Groups.FirstOrDefaultAsync(p => p.GroupId == id);
            if (group == null) return NotFound();
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return Ok(group);
        }
    }
}
