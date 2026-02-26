using BackendProjekt.Auth;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata;
using System.Security.Claims;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BackendProjekt.Controllers
{
    public class ScheduleCreateRequest() 
    {
        public string? templateInfo { get; set; }
        public string? scheduleInfo { get; set; }
    }


    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// NOT IMPLEMENTED YET
    /// </summary>
    //------------------------------------------------------------------------------------------------------------------------
    public class AdvancedInfoController : ControllerBase
    {
        private Context _context;

        public AdvancedInfoController(Context context)
        {
            _context = context;
        }
        // GET: api/<AdvancedInfoController>

        [HttpGet]
        [Authorize(Policy = "AdvancedInfo.Read")]
        public async Task<IActionResult> Get()
        {
            return Ok("Not implemented yet");
        }


        // GET api/<AdvancedInfoController>/5
        [HttpGet("{token}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> Get(string token)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return NotFound();
            }


            var resp = await _context.Users
                .Include(u => u.Usersettings)
                .Include(u => u.Schedulesusersconns)
                    .ThenInclude(su => su.Schedules)
                        .ThenInclude(s => s.Templates)
                .Include(u => u.Groupuserconns)
                    .ThenInclude(gu => gu.Group)
                        .ThenInclude(g => g.Groupscheduleconns)
                            .ThenInclude(gs => gs.Schedule)
                                .ThenInclude(s => s.Templates)
                                    .FirstOrDefaultAsync(u => u.Email == email);

            if (resp == null)
            {
                return NotFound();
            }

            resp.Password = "";
            // Remove Groupscheduleconns from Schedules in Schedulesusersconns
            if (resp.Schedulesusersconns != null)
            {
                foreach (var su in resp.Schedulesusersconns)
                {
                    if (su.Schedules != null)
                    {
                        su.Schedules.Groupscheduleconns = null;
                    }
                }
            }
            // Remove Schedulesusersconns from Schedules in Groupscheduleconns (via Groups)
            if (resp.Groupuserconns != null)
            {
                foreach (var gu in resp.Groupuserconns)
                {
                    if (gu.Group?.Groupscheduleconns != null)
                    {
                        foreach (var gs in gu.Group.Groupscheduleconns)
                        {
                            if (gs.Schedule != null)
                            {
                                gs.Schedule.Schedulesusersconns = null;
                            }
                        }
                    }
                }
            }


            return Ok(resp);
        }

        // POST api/<AdvancedInfoController>

        //[HttpPost]
        //[Authorize(Policy = "AdvancedInfo.Create")]
        //public async Task<IActionResult> Post([FromBody] string value)
        //{
        //    return Ok("Not implemented yet");
        //}

        //// PUT api/<AdvancedInfoController>/5
        //[Authorize(Policy = "AdvancedInfo.Update")]
        //[HttpPut("{id}")]
        //public async Task<IActionResult> Put(int id, [FromBody] string value)
        //{
        //    return Ok("Not implemented yet");
        //}

        //// DELETE api/<AdvancedInfoController>/5
        //[Authorize(Policy = "AdvancedInfo.Delete")]
        //[HttpDelete("{id}")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    return Ok("Not implemented yet");
        //}

        //OKOS FUNKCIÓK ------------------------------------------------------------





        //Schedule/Block Update LEKÉRDEZÉSEK------------------------------------------------------------



        //Schedule/Block Creation LEKÉRDEZÉSEK------------------------------------------------------------

        [HttpPost("groupCreate/{token}/{groupId}")]
        public async Task<IActionResult> Create(string token, int groupId, ScheduleCreateRequest schedule)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if(email == null)
            {
                return NotFound();
            }
            //Leellenőrizzük van-e kapcsolat a User-ünk és a megadott ID-val rendelkező Group között, és hogy van-e hozzáférése
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound();
            }

            if (   !(await _context.Groupuserconns.AnyAsync(guc => guc.GroupId == groupId && guc.UserId == user.UserId && guc.Permission == "admin"))  ) 
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Group-hoz");
            }


            //Először létrehozzuk a template-tt
            Templates templ = new Templates { TemplateInfo = schedule.templateInfo };
            _context.Templates.Add(templ);
            await _context.SaveChangesAsync();
            //Utána a schedule-t
            Schedules sched = new Schedules { TemplateId = templ.TemplateId, ScheduleInfo = schedule.scheduleInfo };
            _context.Schedules.Add(sched);
            await _context.SaveChangesAsync();

            //Aztán a connection-t
            _context.Groupscheduleconns.Add(new Groupscheduleconn
            {
                GroupId = groupId,
                ScheduleId = sched.ScheduleId
            });
            await _context.SaveChangesAsync();


            return Created("Created", schedule);
        }

        [HttpPost("userCreate/{token}")]
        public async Task<IActionResult> Create(string token, ScheduleCreateRequest schedule)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null)
            {
                return BadRequest("Invalid JWT Token");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) 
            {
                return NotFound();
            }

            //Először létrehozzuk a template-tt
            Templates templ = new Templates { TemplateInfo = schedule.templateInfo };
            _context.Templates.Add(templ);
            await _context.SaveChangesAsync();
            //Utána a schedule-t
            Schedules sched = new Schedules { TemplateId = templ.TemplateId, ScheduleInfo = schedule.scheduleInfo };
            _context.Schedules.Add(sched);
            await _context.SaveChangesAsync();

            //Aztán a connection-t
            _context.Schedulesusersconns.Add(new Schedulesusersconn
            {
                UserId = user.UserId,
                ScheduleId = sched.ScheduleId
            });
            await _context.SaveChangesAsync();

            return Created("Created", schedule);
        }

        [HttpPost("blockCreate/{token}/{scheduleId}")]
        public async Task<IActionResult> Create(string toknen, int scheduleId, Blocks block) 
        {
            //Leellenőrizzük a felhasználót, és hogy kapcsolódik-e a schedule-hoz, és jogosult-e block létrehozására a schedule-hoz



            //Hozzáadjuk a block-ot
            _context.Blocks.Add(block);
            await _context.SaveChangesAsync();
            //Hozzáadjuk a Connection-t a block és a schedule között

            await _context.SaveChangesAsync();


            return (Created("created", block));
        }


        //Layout LEKÉRDEZÉSEK------------------------------------------------------------
        [HttpGet("BlocksInRange/{token}/{scheduleId}/{from}/{to}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> GetByYear(string token, int scheduleId,DateTime from, DateTime to)
        {
            //------------------------------------------IDE IDE IDE IDE
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);



            bool hasAccess = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasAccess) 
            {
                return Unauthorized();
            }

            var result = await _context.Schedules.Include(s => s.Templates).ThenInclude(t => t.TemplatesBlocksConns).ThenInclude(conn => conn.Blocks).Where(sch => sch.ScheduleId == scheduleId).ToListAsync();

           
            return Ok(result.Select(r => r.Templates.TemplatesBlocksConns.Select(c => c.Blocks).Where(b => b.Date>=from && b.Date<=to)));
        }




        /// <summary>
        /// Segédosztály
        /// Megadja hogy az adott user kapcsolódik-e vagy egyénileg, vagy csoportokon keresztül a megadott schedule-hoz
        /// </summary>
        /// <param name="user"></param>
        /// <param name="scheduleId"></param>
        /// <returns></returns>
        private async Task<bool> UserHasAccessToSchedule(Users user, int scheduleId)
        {
            if (user == null) return false;

            // Fast in-memory check if navigation properties are already loaded
            if (user.Schedulesusersconns?.Any(su => su.ScheduleId == scheduleId) == true)
                return true;

            if (user.Groupuserconns?.Any(gu => gu.Group?.Groupscheduleconns?.Any(gs => gs.ScheduleId == scheduleId) == true) == true)
                return true;

            // Fallback to efficient DB queries when navigations aren't loaded
            var direct = await _context.Schedulesusersconns
                .AnyAsync(su => su.UserId == user.UserId && su.ScheduleId == scheduleId);
            if (direct) return true;

            var viaGroup = await _context.Groupuserconns
                .Where(gu => gu.UserId == user.UserId)
                .Join(_context.Groupscheduleconns,
                      gu => gu.GroupId,
                      gsc => gsc.GroupId,
                      (gu, gsc) => gsc)
                .AnyAsync(gsc => gsc.ScheduleId == scheduleId);

            return viaGroup;
        }
    }
}
