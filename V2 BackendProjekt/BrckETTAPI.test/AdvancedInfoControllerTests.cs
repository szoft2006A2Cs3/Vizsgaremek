using System.Threading.Tasks;
using BackendProjekt.Auth;
using BackendProjekt.Controllers;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BrckETTAPI.test
{
    [TestClass]
    public class AdvancedInfoControllerTests
    {
        [TestMethod]
        public async Task GetByToken_Missing_BadRequest_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.Get("");
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        // NEW: positive test for Get(token)
        [TestMethod]
        public async Task GetByToken_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users
                {
                    UserId = 11,
                    UserName = "adv",
                    Email = "adv@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"),
                    Role = "admin"
                });
            });

            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "adv@test");
            Assert.IsNotNull(user);
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.Get(token);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var respUser = ((OkObjectResult)res).Value as Users;
            Assert.IsNotNull(respUser);
            Assert.AreEqual("adv@test", respUser.Email);
            // controller sets resp.Password = "" before returning
            Assert.AreEqual(string.Empty, respUser.Password);
        }





        //OKOS FUNKCIÓK/LAYOUT/SCHEDULE/BLOCK METÓDUSOK

        [TestMethod]
        public async Task GetOverlaps_Positive_ReturnsOk()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                var user = new Users
                {
                    UserId = 1,
                    UserName = "overlap",
                    Email = "overlap@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"),
                    Role = "admin"
                };
                ctx.Users.Add(user);
                ctx.Schedules.Add(new Schedules { ScheduleId = 1, TemplateId = 1, ScheduleInfo = "info" });
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 1, ScheduleId = 1 });
                ctx.Templates.Add(new Templates { TemplateId = 1, TemplateInfo = "template" });
                ctx.TemplatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 1, BlockId = 1 });
                ctx.Blocks.Add(new Blocks { BlockId = 1, Date = DateTime.Now, Title = "block" });

                ctx.Schedules.Add(new Schedules { ScheduleId = 2, TemplateId = 2, ScheduleInfo = "info" });
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 1, ScheduleId = 2 });
                ctx.Templates.Add(new Templates { TemplateId = 2, TemplateInfo = "template" });
                ctx.TemplatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 2, BlockId = 2 });
                ctx.Blocks.Add(new Blocks { BlockId = 2, Date = DateTime.Now, Title = "block" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "overlap@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.GetOverlaps(token);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult) );
            var okResult = (OkObjectResult)res;
            Assert.IsNotNull(okResult.Value);
            var blockList = okResult.Value as List<Blocks>;
            if (blockList != null)
            {
                Assert.AreEqual(2, blockList.Count);
            }


        }

        [TestMethod]
        public async Task GetOverlaps_Negative_InvalidToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.GetOverlaps("invalidtoken");
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task GroupCreate_Positive_ReturnsCreated()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 2, UserName = "group", Email = "group@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Groups.Add(new Groups { GroupId = 10, GroupName = "g" });
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 2, GroupId = 10, Permission = "admin" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "group@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleCreateRequest { templateInfo = "t", scheduleInfo = "s" };
            var res = await controller.Create(token, 10, req);
            Assert.IsInstanceOfType(res, typeof(CreatedResult));
        }

        [TestMethod]
        public async Task GroupCreate_Negative_NoPermission_ReturnsUnauthorized()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 3, UserName = "group2", Email = "group2@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Groups.Add(new Groups { GroupId = 11, GroupName = "g2" });
                // No Groupuserconn with admin permission
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "group2@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleCreateRequest { templateInfo = "t", scheduleInfo = "s" };
            var res = await controller.Create(token, 11, req);
            Assert.IsInstanceOfType(res, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task UserCreate_Positive_ReturnsCreated()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 4, UserName = "user", Email = "user@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "user@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleCreateRequest { templateInfo = "t", scheduleInfo = "s" };
            var res = await controller.Create(token, req);
            Assert.IsInstanceOfType(res, typeof(CreatedResult));
        }

        [TestMethod]
        public async Task UserCreate_Negative_InvalidToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleCreateRequest { templateInfo = "t", scheduleInfo = "s" };
            var res = await controller.Create("invalidtoken", req);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task BlockCreate_Positive_ReturnsCreated()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 5, UserName = "block", Email = "block@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 20, TemplateId = 2, ScheduleInfo = "info" });
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 5, ScheduleId = 20 });
                ctx.Templates.Add(new Templates { TemplateId = 2, TemplateInfo = "template" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "block@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var block = new Blocks { Date = DateTime.Today, Title = "block" };
            var res = await controller.Create(token, 20, block);
            Assert.IsInstanceOfType(res, typeof(CreatedResult));
        }

        [TestMethod]
        public async Task BlockCreate_Negative_NoAccess_ReturnsUnauthorized()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 6, UserName = "block2", Email = "block2@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 21, TemplateId = 3, ScheduleInfo = "info" });
                // No Schedulesusersconn or Groupuserconn
                ctx.Templates.Add(new Templates { TemplateId = 3, TemplateInfo = "template" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "block2@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var block = new Blocks { Date = DateTime.Today, Title = "block" };
            var res = await controller.Create(token, 21, block);
            Assert.IsInstanceOfType(res, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task GetByInRange_Positive_ReturnsOk()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 7, UserName = "year", Email = "year@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 30, TemplateId = 4, ScheduleInfo = "info" });
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 7, ScheduleId = 30 });
                ctx.Templates.Add(new Templates { TemplateId = 4, TemplateInfo = "template" });
                ctx.TemplatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 4, BlockId = 10 });
                ctx.Blocks.Add(new Blocks { BlockId = 10, Date = DateTime.Today, Title = "block" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "year@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.GetByInRange(token, 30, DateTime.Today.AddDays(-1), DateTime.Today.AddDays(1));
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }

        [TestMethod]
        public async Task GetByInRange_Negative_NoAccess_ReturnsUnauthorized()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 8, UserName = "year2", Email = "year2@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 31, TemplateId = 5, ScheduleInfo = "info" });
                ctx.Templates.Add(new Templates { TemplateId = 5, TemplateInfo = "template" });
                // No Schedulesusersconn or Groupuserconn
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "year2@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.GetByInRange(token, 31, DateTime.Today.AddDays(-1), DateTime.Today.AddDays(1));
            Assert.IsInstanceOfType(res, typeof(UnauthorizedResult));
        }
    }
}