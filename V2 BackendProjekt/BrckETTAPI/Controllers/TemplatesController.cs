using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TemplatesController : ControllerBase
    {
        private Context _context;

        public TemplatesController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "Templates.Read")]
        public IActionResult Get()
        {
            return Ok(_context.Templates);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Templates.Read")]
        public IActionResult Get(int id, [FromQuery] bool ext = false)
        {
            Templates? template = null;
            if (ext)
            {
                template = _context.Templates
                            //.Include("") 
                            .FirstOrDefault(p => p.TemplateId == id);
            }
            else
            {
                template = _context.Templates.FirstOrDefault(p => p.TemplateId == id);
            }
            if (template == null) return NotFound();
            return Ok(template);
        }

        [HttpPost]
        [Authorize(Policy = "Templates.Create")]
        public IActionResult Post(Templates template)
        {
            _context.Templates.Add(template);
            _context.SaveChanges();
            return CreatedAtAction("create", template);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Templates.Update")]
        public IActionResult Put(int id, Templates template)
        {
            var oldtemplate = _context.Templates.FirstOrDefault(p => p.TemplateId == id);
            if (oldtemplate == null) return NotFound();
            oldtemplate.TemplateId = template.TemplateId;
            oldtemplate.TemplateInfo = template.TemplateInfo;
            _context.SaveChanges();
            return Ok(oldtemplate);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Templates.Delete")]
        public IActionResult Delete(int id)
        {
            var template = _context.Templates.FirstOrDefault(p => p.TemplateId == id);
            if (template == null) return NotFound();
            _context.Templates.Remove(template);
            _context.SaveChanges();
            return Ok(template);
        }
    }
}
