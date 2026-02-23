using System.Threading.Tasks;
using BackendProjekt.Controllers;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Mvc;
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
    }
}