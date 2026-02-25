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
        public async Task Get_Returns_NotImplemented_Pass()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new AdvancedInfoController(db.Context);
            var res = await controller.Get();
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }

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
    }
}