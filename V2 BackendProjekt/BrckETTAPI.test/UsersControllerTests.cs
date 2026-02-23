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
    public class UsersControllerTests
    {
        [TestMethod]
        public void GetAll_ReturnsQueryable_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 1, UserName = "user1", Email = "u1@test", Password = "x" });
            });
            var controller = new UsersController(db.Context);
            var result = controller.Get();
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        }

        [TestMethod]
        public async Task Get_InvalidInput_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new UsersController(db.Context);
            var res = await controller.Get("invalidinput");
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task Get_ByEmail_Found_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 2, UserName = "user2", Email = "found@test", Password = "x" });
            });
            var controller = new UsersController(db.Context);
            var res = await controller.Get("found@test");
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var user = ((OkObjectResult)res).Value as Users;
            Assert.IsNotNull(user);
            Assert.AreEqual("found@test", user.Email);
        }

        [TestMethod]
        public async Task Get_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new UsersController(db.Context);
            var res = await controller.Get("noone@test");
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Post_DuplicateEmail_Fail()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 3, UserName = "user3", Email = "dup@test", Password = "x" });
            });
            var controller = new UsersController(db.Context);
            var newUser = new Users { UserName = "newuser", Email = "dup@test", Password = "pw" };
            var res = await controller.Post(newUser);
            Assert.IsInstanceOfType(res, typeof(BadRequestObjectResult));
        }

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb();
            db.Context.Templates.Add(new Templates { TemplateId = 1, TemplateInfo = null });
            await db.Context.SaveChangesAsync();
            db.Context.Schedules.Add(new Schedules { ScheduleId = 1, TemplateId = 1 });
            db.Context.Groups.Add(new Groups { GroupId = 1, GroupName = "Default" });
            await db.Context.SaveChangesAsync();

            var controller = new UsersController(db.Context);
            var newUser = new Users { UserName = "newuser", Email = "new@test", Password = "pw" };

            var res = await controller.Post(newUser);

            Assert.IsInstanceOfType(res, typeof(CreatedResult));

            var created = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "new@test");
            Assert.IsNotNull(created);

            var us = await db.Context.Usersettings.FirstOrDefaultAsync(s => s.UserId == created.UserId);
            Assert.IsNotNull(us);

            var scheduleConn = await db.Context.Schedulesusersconns.FirstOrDefaultAsync(su => su.UserId == created.UserId && su.ScheduleId == 1);
            Assert.IsNotNull(scheduleConn);

            var groupConn = await db.Context.Groupuserconns.FirstOrDefaultAsync(gu => gu.UserId == created.UserId && gu.GroupId == 1);
            Assert.IsNotNull(groupConn);

            Assert.AreNotEqual("pw", created.Password);
        }

        [TestMethod]
        public async Task Put_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new UsersController(db.Context);
            var res = await controller.Put(9999, new Users { UserName = "x", Email = "x", Password = "x" });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Put_Update_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 4, UserName = "user4", Email = "u4@test", Password = BackendProjekt.Auth.PasswordHandler.HashPassword("old") });
            });
            var controller = new UsersController(db.Context);
            var updated = new Users { UserId = 4, UserName = "user4", Email = "u4@test", Password = "newpw" };
            var res = await controller.Put(4, updated);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var dbu = await db.Context.Users.FirstOrDefaultAsync(u => u.UserId == 4);
            Assert.IsNotNull(dbu);
            Assert.IsTrue(BackendProjekt.Auth.PasswordHandler.VerifyPassword("newpw", dbu.Password));
        }

        [TestMethod]
        public async Task Delete_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new UsersController(db.Context);
            var res = await controller.Delete(9999);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Delete_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 6, UserName = "user6", Email = "del@test", Password = "x" });
            });
            var controller = new UsersController(db.Context);
            var res = await controller.Delete(6);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var dbu = await db.Context.Users.FirstOrDefaultAsync(u => u.UserId == 6);
            Assert.IsNull(dbu);
        }
    }
}