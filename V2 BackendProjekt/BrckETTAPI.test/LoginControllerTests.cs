using System.Security.Claims;
using System.Threading.Tasks;
using BackendProjekt.Auth;
using BackendProjekt.Controllers;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BrckETTAPI.test
{
    [TestClass]
    public class LoginControllerTests
    {
        [TestMethod]
        public async Task Login_WrongPassword_Fail()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 7, UserName = "user7", Email = "login@test", Password = PasswordHandler.HashPassword("correct") });
            });

            var tm = TestHelpers.CreateTokenManager();
            var controller = new LoginController(db.Context, tm);
            var req = new LoginController.LoginRequest { Email = "login@test", Password = "wrong" };
            var res = await controller.Login(req);
            Assert.IsInstanceOfType(res, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task Login_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 8, UserName = "user8", Email = "ok@login", Password = PasswordHandler.HashPassword("secret"), Role = "admin" });
            });

            var tm = TestHelpers.CreateTokenManager();
            var controller = new LoginController(db.Context, tm);
            var req = new LoginController.LoginRequest { Email = "ok@login", Password = "secret" };
            var res = await controller.Login(req);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var token = ((OkObjectResult)res).Value as string;
            Assert.IsFalse(string.IsNullOrEmpty(token));
        }

        [TestMethod]
        public async Task Logout_Unauthorized_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var tm = TestHelpers.CreateTokenManager();
            var controller = new LoginController(db.Context, tm);
            var res = await controller.Logout();
            Assert.IsInstanceOfType(res, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task Logout_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Users.Add(new Users { UserId = 9, UserName = "user9", Email = "logout@test", Password = PasswordHandler.HashPassword("p"), Token = "tkn" });
            });

            var tm = TestHelpers.CreateTokenManager();
            var controller = new LoginController(db.Context, tm);

            var claims = new[] { new Claim(System.Security.Claims.ClaimTypes.Name, "logout@test") };
            var identity = new ClaimsIdentity(claims, "test");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            var res = await controller.Logout();
            Assert.IsInstanceOfType(res, typeof(OkResult));
        }
    }
}           