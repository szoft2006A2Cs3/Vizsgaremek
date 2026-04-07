using BackendProjekt.Auth;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BackendProjekt.Controllers
{
    public class ScheduleRequest() 
    {
        public string? templateInfo { get; set; }
        public string? scheduleInfo { get; set; }
    }
    public class GroupUserConnAction() 
    {
        public bool Accept { get; set; }
    }
    public class BlockRequest() 
    {
        public int BlockId { get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }
        public string? Priority { get; set; }
        public int TimeStart { get; set; }
        public int TimeEnd { get; set; }
        public string? Title { get; set; }
        public ICollection<TemplatesBlocksConn>? TemplatesBlocksConns { get; set; }
        public bool isIgnored { get; set; }
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

        [HttpGet("{token}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> Get(string token)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return BadRequest("Invalid JWT Token");
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
                //Group adatok törlése, a pending GroupConnectionoknál

                foreach (var gu in resp.Groupuserconns)
                {
                    if (gu.Group != null && gu.Permission == "pending")
                    {
                        gu.Group.Groupscheduleconns = null;
                        gu.Group.Groupuserconns = null;
                    }
                }


            }



            return Ok(resp);
        }

        //OKOS FUNKCIÓK ------------------------------------------------------------
        [HttpGet("OverLaps/{token}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> GetOverlaps(string token) 
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return BadRequest("Invalid Token");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) 
            {
                return NotFound();
            }

            var templateIdList = await _context.Schedules
                .Where(s =>
                    _context.Schedulesusersconns.Any(su => su.UserId == user.UserId && su.ScheduleId == s.ScheduleId)
                    ||
                    _context.Groupscheduleconns.Any(gs =>
                        _context.Groupuserconns.Any(gu => gu.UserId == user.UserId && gu.GroupId == gs.GroupId)
                        && gs.ScheduleId == s.ScheduleId
                    )
                )
                .Select(s => s.TemplateId)
                .ToListAsync();


            var groupedBlocks = (await _context.TemplatesBlocksConns
                .Where(tbc => templateIdList.Contains(tbc.TemplateId))
                .Select(tbc => tbc.Blocks)
                .ToListAsync())
                .Where(b => b.Date.HasValue && b.Date >= DateTime.Now.Date)
                .GroupBy(b => b.Date.Value.Date)
                .ToDictionary(g => g.Key, g => g.ToList());

            Console.WriteLine(string.Join("\n", groupedBlocks.Values.ToList()));

            var datesWithMoreThanOneBlock = groupedBlocks.Where(g => g.Value.Count() > 1).Select(g => g.Value).ToList();

            // collect overlapping blocks (per user definition):
            // A and B overlap if A.TimeStart is between B.TimeStart and B.TimeEnd
            // OR A.TimeEnd is between B.TimeStart and B.TimeEnd (we check both directions)
            var overlappingIds = new HashSet<int>();

            foreach (var grp in datesWithMoreThanOneBlock)
            {
                var blocksOnDate = grp.OrderBy(b => b.TimeStart).ToList();

                for (int i = 0; i < blocksOnDate.Count; i++)
                {
                    var a = blocksOnDate[i];
                    for (int j = i + 1; j < blocksOnDate.Count; j++)
                    {
                        var b = blocksOnDate[j];

                        bool aStartInB = a.TimeStart >= b.TimeStart && a.TimeStart <= b.TimeEnd;
                        bool aEndInB = a.TimeEnd >= b.TimeStart && a.TimeEnd <= b.TimeEnd;
                        bool bStartInA = b.TimeStart >= a.TimeStart && b.TimeStart <= a.TimeEnd;
                        bool bEndInA = b.TimeEnd >= a.TimeStart && b.TimeEnd <= a.TimeEnd;

                        if (aStartInB || aEndInB || bStartInA || bEndInA)
                        {
                            overlappingIds.Add(a.BlockId);
                            overlappingIds.Add(b.BlockId);
                        }
                    }
                }
            }
            //Group By Dátum alapján, hogy tudjuk melyik napokon van átfedés
            var res = _context.TemplatesBlocksConns
    .Where(c => overlappingIds.Contains(c.BlockId))
    .Join(_context.Templates,
        c => c.TemplateId,
        t => t.TemplateId,
        (c, t) => new { c, t.TemplateId })
    .Join(_context.Schedules,
        c => c.TemplateId,
        s => s.TemplateId,
        (c, s) => new { c.c, s.ScheduleId })
    .Join(_context.Blocks,
        c => c.c.BlockId,
        b => b.BlockId,
        (c, b) => new
        {
            c.ScheduleId,
            b.BlockId,
            b.Date,
            b.Description,
            b.Priority,
            b.TimeStart,
            b.TimeEnd,
            b.Title,
            IsIgnored = _context.isIgnored.Any(i => i.Block_Id == b.BlockId && i.User_Id == user.UserId)
        })
    .GroupBy(b => b.Date, (key, g) => g.ToList());


            return Ok(res);
        }

        //.Join(_context.Groupscheduleconns,
        //gu => gu.GroupId,
        //              gsc => gsc.GroupId,
        //              (gu, gsc) => gsc)
        //



        //Schedule/Block Update METÓDUSOK------------------------------------------------------------

        [HttpPut("groupUpdate/{token}/{groupId}/{scheduleId}")]
        [Authorize(Policy = "AdvancedInfo.Update")]
        public async Task<IActionResult> Update(string token, int groupId, int scheduleId, ScheduleRequest schedule) 
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null)
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound();
            }

            if ((! await _context.Groupuserconns.AnyAsync(conn => conn.UserId == user.UserId && conn.GroupId == groupId && conn.Permission == "Admin")) && (await _context.Groupscheduleconns.AnyAsync(conn => conn.GroupId == groupId && conn.ScheduleId == scheduleId)))
            {
                return Unauthorized("Nem kapcsolódik a felhasználó a schedule-hoz");
            }

            var oldSchedule = await _context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
            if (oldSchedule == null)
            {
                return NotFound();
            }
            oldSchedule.ScheduleInfo = schedule.scheduleInfo;
            oldSchedule.Templates.TemplateInfo = schedule.templateInfo;
            await _context.SaveChangesAsync();

            return Ok(oldSchedule);
        }



        [HttpPut("userUpdate/{token}/{scheduleId}")]
        [Authorize(Policy = "AdvancedInfo.Update")]
        public async Task<IActionResult> Update(string token, int scheduleId, ScheduleRequest schedule) 
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) 
            {
                return NotFound();
            }
            if (!(await _context.Schedulesusersconns.AnyAsync(conn => conn.ScheduleId == scheduleId && conn.UserId == user.UserId)))
            {
                return Unauthorized("Nem kapcsolódik a felhasználó a schedule-hoz");
            }
            var oldSchedule = await _context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
            if (oldSchedule == null) 
            {
                return NotFound();
            }
            oldSchedule.ScheduleInfo = schedule.scheduleInfo;
            oldSchedule.Templates.TemplateInfo = schedule.templateInfo;
            await _context.SaveChangesAsync();
                
            return Ok(oldSchedule);
        }


        [HttpPut("blockUpdate/{token}/{scheduleId}/{blockId}")]
        [Authorize(Policy = "AdvancedInfo.Update")]
        public async Task<IActionResult> Update(string token,int scheduleId, int blockId, BlockRequest block)
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null)
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound();
            }
            var oldBlock = await _context.Blocks.FirstOrDefaultAsync(b => b.BlockId == blockId);
            if (oldBlock == null)
            {
                return NotFound();
            }
            bool[] hasAccess = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasAccess[0])
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Block-hoz");
            }
            if (hasAccess[1])
            {
                var permission = await _context.Groupuserconns
                    .Where(gu => gu.UserId == user.UserId)
                    .Join(_context.Groupscheduleconns,
                          gu => gu.GroupId,
                          gsc => gsc.GroupId,
                          (gu, gsc) => new { gu.Permission, gsc.ScheduleId })
                    .Where(x => x.ScheduleId == scheduleId)
                    .Select(x => x.Permission)
                    .FirstOrDefaultAsync();
                if (permission != "Admin")
                {
                    return Unauthorized("A felhasználó nem rendelkezik \"Admin\" hozzáféréssel");
                }
            }
            oldBlock.Title = block.Title;
            oldBlock.Description = block.Description;
            oldBlock.Priority = block.Priority;
            oldBlock.Date = block.Date;
            oldBlock.TimeStart = block.TimeStart;
            oldBlock.TimeEnd = block.TimeEnd;


            //IDE KELL UPDATE
            if (block.isIgnored && !_context.isIgnored.Any(i => i.Block_Id == block.BlockId && i.User_Id == user.UserId))
            {
                _context.isIgnored.Add(new isIgnored
                {
                    Block_Id = block.BlockId,
                    User_Id = user.UserId
                });
            }
            else if(!block.isIgnored && _context.isIgnored.Any(i => i.Block_Id == block.BlockId && i.User_Id == user.UserId))
            {
                _context.isIgnored.Remove(_context.isIgnored.FirstOrDefault(i => i.Block_Id == block.BlockId && i.User_Id == user.UserId));
            }
 
            await _context.SaveChangesAsync();
            return Ok(oldBlock);
        }


        //Schedule/Block Creation METÓDUSOK------------------------------------------------------------

        [HttpPost("groupCreate/{token}/{groupId}")]
        [Authorize(Policy = "AdvancedInfo.Create")]
        public async Task<IActionResult> Create(string token, int groupId, ScheduleRequest schedule)
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

            if (! (await _context.Groupuserconns.AnyAsync(guc => guc.GroupId == groupId && guc.UserId == user.UserId && guc.Permission == "Admin"))) 
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Group-hoz");
            }


            //Először létrehozzuk a template-t
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
        [Authorize(Policy = "AdvancedInfo.Create")]
        public async Task<IActionResult> Create(string token, ScheduleRequest schedule)
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
        [Authorize(Policy = "AdvancedInfo.Create")]
        public async Task<IActionResult> Create(string token, int scheduleId, Blocks block) 
        {
            //Leellenőrizzük a felhasználót, és hogy kapcsolódik-e a schedule-hoz, és jogosult-e block létrehozására a schedule-hoz
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

            bool[] hasConnection = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasConnection[0])
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Schedule-hoz");
            }
            if (hasConnection[1])
            {
                var permission = await _context.Groupuserconns
                .Where(gu => gu.UserId == user.UserId)
                .Join(_context.Groupscheduleconns,
                      gu => gu.GroupId,
                      gsc => gsc.GroupId,
                      (gu, gsc) => new { gu.Permission, gsc.ScheduleId })
                .Where(x => x.ScheduleId == scheduleId)
                .Select(x => x.Permission)
                .FirstOrDefaultAsync();

                if (permission != "Admin") 
                {
                    return Unauthorized("A felhasználó nem rendelkezik \"Admin\" hozzáféréssel");
                }
            }



            var templateId = await _context.Schedules.Where(s => s.ScheduleId == scheduleId).Select(t => t.TemplateId).FirstOrDefaultAsync();


            //Hozzáadjuk a block-ot
            _context.Blocks.Add(block);
            await _context.SaveChangesAsync();
            //Hozzáadjuk a Connection-t a block és a schedule között
            var conn = new TemplatesBlocksConn
            {
                TemplateId = templateId,
                BlockId = block.BlockId
            };
            _context.TemplatesBlocksConns.Add(conn);
            await _context.SaveChangesAsync();


            return (Created("created", block));
        }

        //Schedule/Block/Group Törlés METÓDUSOK------------------------------------------------------------

        [HttpDelete("DeleteBlock/{token}/{scheduleId}/{blockId}")]
        public async Task<IActionResult> Delete(string token, int scheduleId, int blockId)
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
            var block = await _context.Blocks.FirstOrDefaultAsync(b => b.BlockId == blockId);
            if (block == null)
            {
                return NotFound();
            }
            bool[] hasAccess = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasAccess[0])
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Block-hoz");
            }
            if (hasAccess[1])
            {
                var permission = await _context.Groupuserconns
                    .Where(gu => gu.UserId == user.UserId)
                    .Join(_context.Groupscheduleconns,
                          gu => gu.GroupId,
                          gsc => gsc.GroupId,
                          (gu, gsc) => new { gu.Permission, gsc.ScheduleId })
                    .Where(x => x.ScheduleId == scheduleId)
                    .Select(x => x.Permission)
                    .FirstOrDefaultAsync();
                if (permission != "Admin")
                {
                    return Unauthorized("A felhasználó nem rendelkezik \"Admin\" hozzáféréssel");
                }
            }
            _context.Blocks.Remove(block);
            await _context.SaveChangesAsync();
            return Ok("Block Deleted");
        }
        [HttpDelete("DeleteGroup/{token}/{groupId}")]
        public async Task<IActionResult> Delete(string token, int groupId)
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
            var group = await _context.Groups.FirstOrDefaultAsync(g => g.GroupId == groupId);
            if (group == null)
            {
                return NotFound();
            }
            if (!await _context.Groupuserconns.AnyAsync(conn => conn.UserId == user.UserId && conn.GroupId == groupId && conn.Permission == "Admin"))
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Group-hoz");
            }
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return Ok("Group Deleted");
        }
        [HttpDelete("DeleteSchedule/{token}/{scheduleId}")]
        public async Task<IActionResult> DeleteSched(string token, int scheduleId)
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
            var schedule = await _context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == scheduleId);
            if (schedule == null)
            {
                return NotFound();
            }
            bool[] hasAccess = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasAccess[0])
            {
                return Unauthorized("Nem fér hozzá a felhasználó az adott Schedule-hoz");
            }
            if (hasAccess[1])
            {
                var permission = await _context.Groupuserconns
                    .Where(gu => gu.UserId == user.UserId)
                    .Join(_context.Groupscheduleconns,
                          gu => gu.GroupId,
                          gsc => gsc.GroupId,
                          (gu, gsc) => new { gu.Permission, gsc.ScheduleId })
                    .Where(x => x.ScheduleId == scheduleId)
                    .Select(x => x.Permission)
                    .FirstOrDefaultAsync();
                if (permission != "Admin")
                {
                    return Unauthorized("A felhasználó nem rendelkezik \"Admin\" hozzáféréssel");
                }
            }
            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return Ok("Schedule Deleted");
        }






        //Layout LEKÉRDEZÉSEK------------------------------------------------------------
        [HttpGet("BlocksInRange/{token}/{scheduleId}/{from}/{to}")]
        [Authorize(Policy = "AdvancedInfo.ReadByToken")]
        public async Task<IActionResult> GetByInRange(string token, int scheduleId,DateTime from, DateTime to)
        {
            //------------------------------------------IDE IDE IDE IDE
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);



            bool[] hasAccess = await UserHasAccessToSchedule(user, scheduleId);
            if (!hasAccess[0]) 
            {
                return Unauthorized();
            }

            var result = await _context.Schedules.Include(s => s.Templates).ThenInclude(t => t.TemplatesBlocksConns).ThenInclude(conn => conn.Blocks).Where(sch => sch.ScheduleId == scheduleId).ToListAsync();


            return Ok(result.Select(r => r.Templates.TemplatesBlocksConns.Select(c => c.Blocks).Select(b => { b.TemplatesBlocksConns = null; return b; }).Where(b => b.Date >= from && b.Date <= to)));
        }
        [HttpPost("GroupUserConn/{token}/{groupId}")]
        [Authorize(Policy = "AdvancedInfo.Update")]
        public async Task<IActionResult> UpdateGroupUserConn(string token,int groupId, GroupUserConnAction action) 
        {
            var email = TokenManager.GetEmailFromToken(token);
            if (email == null) 
            {
                return NotFound();
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            var connection = await _context.Groupuserconns.Where(conn => conn.UserId == user.UserId && conn.GroupId == groupId).FirstOrDefaultAsync();
            if (action.Accept)
            {
                connection.Permission = "user";
            }
            else 
            {
                _context.Groupuserconns.Remove(connection);
            }
            await _context.SaveChangesAsync();

            return Ok(action.Accept ? "Invite Accepted" : "Invite Declined");
        }



        /// <summary>
        /// SegédMetódus
        /// Megadja hogy az adott user kapcsolódik-e vagy egyénileg, vagy csoportokon keresztül a megadott schedule-hoz
        /// </summary>
        /// <param name="user"></param>
        /// <param name="scheduleId"></param>
        /// <returns></returns>
        private async Task<bool[]> UserHasAccessToSchedule(Users user, int scheduleId)
        {
            if (user == null) return [false, false];

            // Fast in-memory check if navigation properties are already loaded
            if (user.Schedulesusersconns?.Any(su => su.ScheduleId == scheduleId) == true)
                return [true, false];

            if (user.Groupuserconns?.Any(gu => gu.Group?.Groupscheduleconns?.Any(gs => gs.ScheduleId == scheduleId) == true) == true)
                return [true, true];

            // Fallback to efficient DB queries when navigations aren't loaded
            var direct = await _context.Schedulesusersconns
                .AnyAsync(su => su.UserId == user.UserId && su.ScheduleId == scheduleId);
            if (direct) return [true, false];

            var viaGroup = await _context.Groupuserconns
                .Where(gu => gu.UserId == user.UserId)
                .Join(_context.Groupscheduleconns,
                      gu => gu.GroupId,
                      gsc => gsc.GroupId,
                      (gu, gsc) => gsc)
                .AnyAsync(gsc => gsc.ScheduleId == scheduleId);

            return [viaGroup, true];
        }
    }
}
