using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlocksController : Controller
    {
        private Context _context;

        public BlocksController(Context context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Policy = "Blocks.Read")]
        public async Task<IActionResult> Get()
        {
            return Ok(await _context.Blocks.ToListAsync());
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "Blocks.Read")]
        public async Task<IActionResult> Get(int id, [FromQuery] bool ext = false)
        {
            Blocks? block = null;
            if (ext)
            {
                block = await _context.Blocks
                            .FirstOrDefaultAsync(p => p.BlockId == id);
            }
            else
            {
                block = await _context.Blocks.FirstOrDefaultAsync(p => p.BlockId == id);
            }
            if (block == null) return NotFound();
            return Ok(block);
        }

        [HttpPost]
        [Authorize(Policy = "Blocks.Create")]
        public async Task<IActionResult> Post(Blocks block)
        {
            _context.Blocks.Add(block);
            await _context.SaveChangesAsync();
            return Created("create", block);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "Blocks.Update")]
        public async Task<IActionResult> Put(int id, Blocks block)
        {
            var oldBlock = await _context.Blocks.FirstOrDefaultAsync(p => p.BlockId == id);
            if (oldBlock == null) return NotFound();

            oldBlock.Date = block.Date;
            oldBlock.Description = block.Description;
            oldBlock.Priority = block.Priority;
            oldBlock.TimeStart = block.TimeStart;
            oldBlock.TimeEnd = block.TimeEnd;
            oldBlock.Title = block.Title;
            oldBlock.IsIgnored = block.IsIgnored;


            await _context.SaveChangesAsync();
            return Ok(oldBlock);

        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Blocks.Delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var block = await _context.Blocks.FirstOrDefaultAsync(p => p.BlockId == id);
            if (block == null) return NotFound();
            _context.Blocks.Remove(block);
            await _context.SaveChangesAsync();
            return Ok(block);
        }


    }
}
