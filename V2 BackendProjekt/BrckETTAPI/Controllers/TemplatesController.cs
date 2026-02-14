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
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Templates.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Templates.Read")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool ext = false)
        {
            Templates? template = null;
            if (ext)
            {
                template = await _context.Templates
                            //.Include("") 
                            .FirstOrDefaultAsync(p => p.TemplateId == id);
            }
            else
            {
                template = await _context.Templates.FirstOrDefaultAsync(p => p.TemplateId == id);
            }
            if (template == null) return NotFound();
            return Ok(template);
        }

        [HttpPost]
        [Authorize(Policy = "Templates.Create")]
        public async Task<IActionResult> Post(Templates template)
        {
            _context.Templates.Add(template);
            await _context.SaveChangesAsync();
            return CreatedAtAction("create", template);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Templates.Update")]
        public async Task<IActionResult> Put(int id, Templates template)
        {
            var oldtemplate = await _context.Templates.FirstOrDefaultAsync(p => p.TemplateId == id);
            if (oldtemplate == null) return NotFound();
            oldtemplate.TemplateId = template.TemplateId;
            oldtemplate.TemplateInfo = template.TemplateInfo;
            await _context.SaveChangesAsync();
            return Ok(oldtemplate);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Templates.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var template = await _context.Templates.FirstOrDefaultAsync(p => p.TemplateId == id);
            if (template == null) return NotFound();
            _context.Templates.Remove(template);
            await _context.SaveChangesAsync();
            return Ok(template);
        }
    }
}
