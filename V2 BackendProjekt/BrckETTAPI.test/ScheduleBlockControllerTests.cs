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
                ctx.Schedules.Add(new Schedules { ScheduleId = 100, TemplateId = 500 });
                ctx.Templates.Add(new Templates { TemplateId = 500, TemplateInfo = "t" });
                ctx.Blocks.Add(new Blocks { BlockId = 301, Title = "B1", TimeStart = 0, TimeEnd = 1 });
                ctx.templatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 500, BlockId = 301 });
                ctx.Users.Add(new Users { UserId = 21, UserName = "user21", Email = "sb@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("x") });
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
                ctx.Templates.Add(new Templates { TemplateId = 600 });
                ctx.Schedules.Add(new Schedules { ScheduleId = 200, TemplateId = 600 });
                ctx.Blocks.Add(new Blocks { BlockId = 401, Title = "BlockA", TimeStart = 0, TimeEnd = 1 });
                ctx.templatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 600, BlockId = 401 });
                var u = new Users { UserId = 31, UserName = "user31", Email = "hasconn@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("x") };
                ctx.Users.Add(u);
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 31, ScheduleId = 200 });
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