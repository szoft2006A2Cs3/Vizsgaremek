using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public IActionResult Get()
        {
            return Ok(_context.Groups);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Groups.Read")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Groups? group = null;
            if (ext)
            {
                group = _context.Groups
                            //.Include("") 
                            .FirstOrDefault(p => p.GroupId == id);
            }
            else
            {
                group = _context.Groups.FirstOrDefault(p => p.GroupId == id);
            }
            if (group == null) return NotFound();
            return Ok(group);
        }

        [HttpPost]
        [Authorize(Policy = "Groups.Create")]
        public IActionResult Post(Groups group)
        {
            _context.Groups.Add(group);
            _context.SaveChanges();
            return CreatedAtAction("create", group);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Groups.Update")]
        public IActionResult Put(int id, Groups group)
        {
            var oldGroup = _context.Groups.FirstOrDefault(p => p.GroupId == id);
            if (oldGroup == null) return NotFound();
            //oldGroup.GroupId = group.GroupId;
            oldGroup.GroupName = group.GroupName;
            _context.SaveChanges();
            return Ok(oldGroup);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Groups.Delete")]
        public IActionResult Delete(int id)
        {
            var group = _context.Groups.FirstOrDefault(p => p.GroupId == id);
            if (group == null) return NotFound();
            _context.Groups.Remove(group);
            _context.SaveChanges();
            return Ok(group);
        }
    }
}
