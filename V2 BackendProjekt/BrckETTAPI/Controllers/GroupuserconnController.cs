using BackendProjekt.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupuserconnController : ControllerBase
    {
        private Context _context;

        public GroupuserconnController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(_context.Groupuserconns);
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Groupuserconn? groupuserconns = null;
            if (ext)
            {
                groupuserconns = _context.Groupuserconns
                            .Include("Groups")
                            .Include("Users")
                            .FirstOrDefault(p => p.GroupId == id);
            }
            else
            {
                groupuserconns = _context.Groupuserconns.FirstOrDefault(p => p.GroupId == id);
            }
            if (groupuserconns == null) return NotFound();
            return Ok(groupuserconns);
        }

        [HttpPost]
        public IActionResult Post(Groupuserconn groupuserconns)
        {
            _context.Groupuserconns.Add(groupuserconns);
            _context.SaveChanges();
            return CreatedAtAction("create", groupuserconns);
        }

        [HttpPut("{id}")]
        public IActionResult Put(int id, Groupuserconn groupuserconns)
        {
            var oldgroupuserconns = _context.Groupuserconns.FirstOrDefault(p => p.UserId == id);
            if (oldgroupuserconns == null) return NotFound();
            oldgroupuserconns.UserId = groupuserconns.UserId;
            oldgroupuserconns.GroupId = groupuserconns.GroupId;
            oldgroupuserconns.Permission = groupuserconns.Permission;
            _context.SaveChanges();
            return Ok(oldgroupuserconns);

        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var groupuserconns = _context.Groupuserconns.FirstOrDefault(p => p.GroupId == id);
            if (groupuserconns == null) return NotFound();
            _context.Groupuserconns.Remove(groupuserconns);
            _context.SaveChanges();
            return Ok(groupuserconns);
        }
    }
}
