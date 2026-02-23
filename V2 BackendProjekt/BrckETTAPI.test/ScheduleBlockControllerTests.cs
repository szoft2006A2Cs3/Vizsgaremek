using System.Linq;
using System.Threading.Tasks;
using BackendProjekt.Controllers;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BrckETTAPI.test
{
    [TestClass]
    public class ScheduleBlockControllerTests
    {
        [TestMethod]
        public async Task UserNoConnection_Returns_404_Fail()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                // Create template and schedule
                ctx.Templates.Add(new Templates { TemplateId = 600 });
                ctx.Schedules.Add(new Schedules { ScheduleId = 200, TemplateId = 600 });
                // Create block and link to template
                ctx.Blocks.Add(new Blocks { BlockId = 401, Title = "BlockA", TimeStart = 0, TimeEnd = 1 });
                ctx.templatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 600, BlockId = 401 });
                // Create user (not connected to any group)
                ctx.Users.Add(new Users
                {
                    UserId = 21,
                    UserName = "user21",
                    Email = "sb@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("x"),
                    Role = "user" // <-- Add this line!
                });
            });

            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FindAsync(21);
            var token = tm.GenerateToken(user!);

            var controller = new ScheduleBlockController(db.Context);
            var res = await controller.Get(token, 100);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task UserHasConnection_Returns_Blocks_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                // Create template and schedule
                ctx.Templates.Add(new Templates { TemplateId = 600 });
                ctx.Schedules.Add(new Schedules { ScheduleId = 200, TemplateId = 600 });
                // Create block and link to template
                ctx.Blocks.Add(new Blocks { BlockId = 401, Title = "BlockA", TimeStart = 0, TimeEnd = 1 });
                ctx.templatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 600, BlockId = 401 });
                // Create user
                var u = new Users
                {
                    UserId = 31,
                    UserName = "user31",
                    Email = "hasconn@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("x"),
                    Role = "user" // <-- Use the correct case and value!
                };
                ctx.Users.Add(u);
                // Create group and connect user to group
                ctx.Groups.Add(new Groups { GroupId = 1, GroupName = "TestGroup" });
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 31, GroupId = 1, Permission = "user" });
                // Connect group to schedule
                ctx.Groupscheduleconns.Add(new Groupscheduleconn { GroupId = 1, ScheduleId = 200 });
            });

            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "hasconn@test");
            var token = tm.GenerateToken(user);

            var controller = new ScheduleBlockController(db.Context);
            var res = await controller.Get(token, 200);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var blocks = ((OkObjectResult)res).Value as System.Collections.Generic.IEnumerable<Blocks>;
            Assert.IsNotNull(blocks);
            Assert.AreEqual(1, blocks!.Count());
        }
    }
}