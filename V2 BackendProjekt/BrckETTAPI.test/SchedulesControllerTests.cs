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
                ctx.Templates.Add(new Templates { TemplateId = 100, TemplateInfo = null });
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

        // NEW: positive test for Get(id) where id is TemplateId
        [TestMethod]
        public async Task GetById_Found_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Templates.Add(new Templates { TemplateId = 500, TemplateInfo = "tpl" });
                ctx.Schedules.Add(new Schedules { ScheduleId = 5, TemplateId = 500, ScheduleInfo = "s" });
            });

            var controller = new SchedulesController(db.Context);
            // controller.Get uses the route id as TemplateId
            var res = await controller.Get(5);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var schedule = ((OkObjectResult)res).Value as Schedules;
            Assert.IsNotNull(schedule);
            Assert.AreEqual(500, schedule.TemplateId);
            Assert.AreEqual(5, schedule.ScheduleId);
        }

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Templates.Add(new Templates { TemplateId = 200, TemplateInfo = null });
            });
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
                ctx.Templates.Add(new Templates { TemplateId = 300, TemplateInfo = null });
                ctx.Schedules.Add(new Schedules { ScheduleId = 3, TemplateId = 300, ScheduleInfo = "old" });
            });
            var controller = new SchedulesController(db.Context);
            var res = await controller.Put(3, new Schedules { ScheduleId = 3, TemplateId = 300, ScheduleInfo = "new" });
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
                ctx.Templates.Add(new Templates { TemplateId = 400, TemplateInfo = null });
                ctx.Schedules.Add(new Schedules { ScheduleId = 4, TemplateId = 400 });
            });
            var controller = new SchedulesController(db.Context);
            var res = await controller.Delete(4);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }
    }
}