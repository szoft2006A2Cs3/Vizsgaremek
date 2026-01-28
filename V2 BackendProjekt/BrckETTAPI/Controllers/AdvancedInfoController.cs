using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BackendProjekt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// NOT IMPLEMENTED YET
    /// </summary>
    //------------------------------------------------------------------------------------------------------------------------
    public class AdvancedInfoController : ControllerBase
    {
        // GET: api/<AdvancedInfoController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<AdvancedInfoController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<AdvancedInfoController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<AdvancedInfoController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<AdvancedInfoController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
