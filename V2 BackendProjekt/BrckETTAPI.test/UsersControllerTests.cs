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

            var controller = new UsersController(db.Context);
            var newUser = new Users { UserName = "newuser", Email = "new@test", Password = "pw", Role = "admin" };

            var res = await controller.Post(newUser);

            Assert.IsInstanceOfType(res, typeof(CreatedResult));

            var created = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "new@test");
            Assert.IsNotNull(created);

            var us = await db.Context.Usersettings.FirstOrDefaultAsync(s => s.UserId == created.UserId);
            Assert.IsNotNull(us);

            // There should be two templates and two schedules (user + group)
            var templates = await db.Context.Templates.ToListAsync();
            Assert.IsTrue(templates.Count >= 2);

            var schedules = await db.Context.Schedules.ToListAsync();
            Assert.IsTrue(schedules.Count >= 2);

            // There should be at least one group
            var group = await db.Context.Groups.FirstOrDefaultAsync();
            Assert.IsNotNull(group);

            // The user's schedule and group connections should exist
            var scheduleConn = await db.Context.Schedulesusersconns.FirstOrDefaultAsync(su => su.UserId == created.UserId);
            Assert.IsNotNull(scheduleConn);

            var groupConn = await db.Context.Groupuserconns.FirstOrDefaultAsync(gu => gu.UserId == created.UserId);
            Assert.IsNotNull(groupConn);

            Assert.AreNotEqual("pw", created.Password);
        }

        [TestMethod]
        public async Task Put_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new UsersController(db.Context);

            // Create a fake user just for token generation (not added to DB)
            var fakeUser = new Users
            {
                UserId = 9999,
                UserName = "x",
                Email = "x@notfound.com",
                Password = "x",
                Role = "admin"
            };
            var tm = TestHelpers.CreateTokenManager();
            var token = tm.GenerateToken(fakeUser);

            var res = await controller.Put(token, new Users { UserName = "x", Email = "x", Password = "x", Role = "user" });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Put_Update_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users
                {
                    UserId = 4,
                    UserName = "user4",
                    Email = "u4@test",
                    Password = BackendProjekt.Auth.PasswordHandler.HashPassword("old"),
                    Role = "admin"
                });
            });

            var tm = TestHelpers.CreateTokenManager();
            var user = await db.Context.Users.FirstAsync(u => u.UserId == 4);
            var token = tm.GenerateToken(user);

            var controller = new UsersController(db.Context);
            var updated = new Users
            {
                UserId = 4,
                UserName = "user4new",
                Email = "u4new@test",
                Password = "newpw",
                Role = "admin"
            };

            var res = await controller.Put(token, updated);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var dbu = await db.Context.Users.FirstOrDefaultAsync(u => u.UserId == 4);
            Assert.IsNotNull(dbu);
            Assert.AreEqual("user4new", dbu.UserName);
            Assert.AreEqual("u4new@test", dbu.Email);
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

        // Chain test: Create -> Update -> Delete (Post returns created user and also creates related records)
        [TestMethod]
        public async Task Users_Chain_CRUD_Pass()
        {
            using var db = TestHelpers.CreateTestDb();

            var controller = new UsersController(db.Context);

            // Create user
            var newUser = new Users { UserName = "chainuser", Email = "chain@test", Password = "pw", Role = "admin" };
            var postRes = await controller.Post(newUser);
            Assert.IsInstanceOfType(postRes, typeof(CreatedResult));

            var created = await db.Context.Users.FirstOrDefaultAsync(u => u.Email == "chain@test");
            Assert.IsNotNull(created);

            // Update via token
            var tm = TestHelpers.CreateTokenManager();
            var token = tm.GenerateToken(created);
            var updated = new Users { UserName = "chainuser-upd", Email = "chain-upd@test", Password = "pw", Role = "admin" };
            var putRes = await controller.Put(token, updated);
            Assert.IsInstanceOfType(putRes, typeof(OkObjectResult));

            var dbu = await db.Context.Users.FirstOrDefaultAsync(u => u.UserId == created.UserId);
            Assert.IsNotNull(dbu);
            Assert.AreEqual("chainuser-upd", dbu.UserName);
            Assert.AreEqual("chain-upd@test", dbu.Email);

            // Delete
            var delRes = await controller.Delete(created.UserId);
            Assert.IsInstanceOfType(delRes, typeof(OkObjectResult));
            var deleted = await db.Context.Users.FirstOrDefaultAsync(u => u.UserId == created.UserId);
            Assert.IsNull(deleted);
        }
    }
}