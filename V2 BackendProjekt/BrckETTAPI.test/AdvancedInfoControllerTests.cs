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
                ctx.Blocks.Add(new Blocks { BlockId = 2, Date = DateTime.Now, Title = "bloc k" });
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
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 2, GroupId = 10, Permission = "Admin" });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "group@test");
            var token = tm.GenerateToken(user!);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "t", scheduleInfo = "s" };
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
            var req = new ScheduleRequest { templateInfo = "t", scheduleInfo = "s" };
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
            var req = new ScheduleRequest { templateInfo = "t", scheduleInfo = "s" };
            var res = await controller.Create(token, req);
            Assert.IsInstanceOfType(res, typeof(CreatedResult));
        }

        [TestMethod]
        public async Task UserCreate_Negative_InvalidToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "t", scheduleInfo = "s" };
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
            var block = new Blocks { BlockId = 1, Title = "b" };
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

        [TestMethod]
        public async Task UserUpdate_Positive_ReturnsOk()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 100, UserName = "user", Email = "user@update", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Templates.Add(new Templates { TemplateId = 100, TemplateInfo = "old" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 100, TemplateId = 100, ScheduleInfo = "old" });
                ctx.Schedulesusersconns.Add(new Schedulesusersconn { UserId = 100, ScheduleId = 100 });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "user@update");
            var token = tm.GenerateToken(user);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "newT", scheduleInfo = "newS" };
            var res = await controller.Update(token, 100, req);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var updated = (await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == 100));
            Assert.AreEqual("newS", updated.ScheduleInfo);
            Assert.AreEqual("newT", updated.Templates.TemplateInfo);
        }

        [TestMethod]
        public async Task UserUpdate_Negative_NoAccess_ReturnsUnauthorized()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 101, UserName = "user", Email = "user@update2", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Templates.Add(new Templates { TemplateId = 101, TemplateInfo = "old" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 101, TemplateId = 101, ScheduleInfo = "old" });
                // No Schedulesusersconn
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "user@update2");
            var token = tm.GenerateToken(user);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "newT", scheduleInfo = "newS" };
            var res = await controller.Update(token, 101, req);
            Assert.IsInstanceOfType(res, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task GroupUpdate_Positive_ReturnsOk()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 200, UserName = "admin", Email = "admin@group", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Groups.Add(new Groups { GroupId = 200, GroupName = "g" });
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 200, GroupId = 200, Permission = "Admin" });
                ctx.Templates.Add(new Templates { TemplateId = 200, TemplateInfo = "old" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 200, TemplateId = 200, ScheduleInfo = "old" });
                ctx.Groupscheduleconns.Add(new Groupscheduleconn { GroupId = 200, ScheduleId = 200 });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "admin@group");
            var token = tm.GenerateToken(user);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "newT", scheduleInfo = "newS" };
            var res = await controller.Update(token, 200, 200, req);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var updated = (await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == 200));
            Assert.AreEqual("newS", updated.ScheduleInfo);
            Assert.AreEqual("newT", updated.Templates.TemplateInfo);
        }

        [TestMethod]
        public async Task GroupUpdate_Negative_NoAdmin_ReturnsUnauthorized()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 201, UserName = "user", Email = "user@group", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"), Role = "admin" });
                ctx.Groups.Add(new Groups { GroupId = 201, GroupName = "g" });
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 201, GroupId = 201, Permission = "user" }); // Not Admin
                ctx.Templates.Add(new Templates { TemplateId = 201, TemplateInfo = "old" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 201, TemplateId = 201, ScheduleInfo = "old" });
                ctx.Groupscheduleconns.Add(new Groupscheduleconn { GroupId = 201, ScheduleId = 201 });
            });
            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "user@group");
            var token = tm.GenerateToken(user);

            var controller = new AdvancedInfoController(db.Context);
            var req = new ScheduleRequest { templateInfo = "newT", scheduleInfo = "newS" };
            var res = await controller.Update(token, 201, 201, req);
            Assert.IsInstanceOfType(res, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task BlockUpdate_Negative_InvalidToken_ReturnsNotFound()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var block = new BlockRequest { BlockId = 1, Title = "b" };
            var res = await controller.Update("invalidtoken", 1, 1, block);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task BlockUpdate_Positive_ReturnsOk()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users
                {
                    UserId = 10,
                    UserName = "blockadmin",
                    Email = "blockadmin@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("pw"),
                    Role = "admin"
                });
                ctx.Groups.Add(new Groups { GroupId = 10, GroupName = "g" });
                ctx.Groupuserconns.Add(new Groupuserconn { UserId = 10, GroupId = 10, Permission = "Admin" });
                ctx.Templates.Add(new Templates { TemplateId = 10, TemplateInfo = "template" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 10, TemplateId = 10, ScheduleInfo = "sched" });
                ctx.Groupscheduleconns.Add(new Groupscheduleconn { GroupId = 10, ScheduleId = 10 });
                ctx.Blocks.Add(new Blocks
                {
                    BlockId = 100,
                    Title = "OldTitle",
                    Description = "OldDesc",
                    Priority = "Low",
                    Date = DateTime.Today,
                    TimeStart = 1,
                    TimeEnd = 2
                });
                ctx.TemplatesBlocksConns.Add(new TemplatesBlocksConn { TemplateId = 10, BlockId = 100 });
            });

            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.Email == "blockadmin@test");
            var token = tm.GenerateToken(user);

            var controller = new AdvancedInfoController(db.Context);

            var updatedBlock = new BlockRequest
            {
                BlockId = 100,
                Title = "NewTitle",
                Description = "NewDesc",
                Priority = "High",
                Date = DateTime.Today.AddDays(1),
                TimeStart = 3,
                TimeEnd = 4,
                isIgnored = false
            };

            var res = await controller.Update(token, 10, 100, updatedBlock);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            // You may need to use dynamic or check properties individually if the return type is anonymous
        }
        [TestMethod]
        public async Task GetMembers_NoToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.GetMembers("", 1);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task EditGroup_NoToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.EditGroup("", 1, "name", new List<PermissionRequest>());
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task InviteUser_NoToken_ReturnsNotFound()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.InviteUser("", 1, "test@test.com");
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task CreateNewGroup_NoToken_ReturnsNotFound()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.createNewGroup("", new Groups { GroupName = "g" });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task UpdateGroupUserConn_NoToken_ReturnsNotFound()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.UpdateGroupUserConn("", 1, new GroupUserConnAction { Accept = true });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task DeleteBlock_NoToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.Delete("", 1, 1);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task DeleteGroup_NoToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.Delete("", 1);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task DeleteSched_NoToken_ReturnsBadRequest()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.DeleteSched("", 1);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }
    }
}