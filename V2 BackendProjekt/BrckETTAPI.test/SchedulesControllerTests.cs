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
    public class SchedulesControllerTests
    {
        [TestMethod]
        public async Task GetAll_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Schedules.Add(new Schedules { ScheduleId = 1, TemplateId = 100 });
            });
            var controller = new SchedulesController(db.Context);
            var res = await controller.Get();
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var list = ((OkObjectResult)res).Value as System.Collections.IEnumerable;
            Assert.IsNotNull(list);
        }

        [TestMethod]
        public async Task GetById_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new SchedulesController(db.Context);
            var res = await controller.Get(999);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new SchedulesController(db.Context);
            var res = await controller.Post(new Schedules { ScheduleId = 2, TemplateId = 200 });
            Assert.IsInstanceOfType(res, typeof(CreatedAtActionResult));
        }

        [TestMethod]
        public async Task Put_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new SchedulesController(db.Context);
            var res = await controller.Put(999, new Schedules { TemplateId = 1, ScheduleId = 999 });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Put_Update_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Schedules.Add(new Schedules { ScheduleId = 3, TemplateId = 300, ScheduleInfo = "old" });
            });
            var controller = new SchedulesController(db.Context);
            var res = await controller.Put(300, new Schedules { ScheduleId = 3, TemplateId = 300, ScheduleInfo = "new" });
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var dbs = await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == 3);
            Assert.IsNotNull(dbs);
            Assert.AreEqual("new", dbs.ScheduleInfo);
        }

        [TestMethod]
        public async Task Delete_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new SchedulesController(db.Context);
            var res = await controller.Delete(999);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Delete_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Schedules.Add(new Schedules { ScheduleId = 4, TemplateId = 400 });
            });
            var controller = new SchedulesController(db.Context);
            var res = await controller.Delete(400);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }
    }
}