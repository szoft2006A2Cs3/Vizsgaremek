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

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb();

            // Ensure referenced template exists to satisfy FK constraint
            db.Context.Templates.Add(new Templates { TemplateId = 200, TemplateInfo = "test template" });
            await db.Context.SaveChangesAsync();

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

        // Chain test: Create -> Get -> Update -> Delete
        [TestMethod]
        public async Task Schedules_Chain_CRUD_Pass()
        {
            using var db = TestHelpers.CreateTestDb();

            // ensure template exists for FK
            db.Context.Templates.Add(new Templates { TemplateInfo = "chain-template" });
            await db.Context.SaveChangesAsync();
            var template = await db.Context.Templates.FirstOrDefaultAsync(t => t.TemplateInfo == "chain-template");

            var controller = new SchedulesController(db.Context);

            // Create
            var toCreate = new Schedules { TemplateId = template.TemplateId, ScheduleInfo = "ChainSched" };
            var postRes = await controller.Post(toCreate);
            Assert.IsInstanceOfType(postRes, typeof(CreatedAtActionResult));

            var created = await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleInfo == "ChainSched");
            Assert.IsNotNull(created);

            // Get
            var getRes = await controller.Get(created.ScheduleId);
            Assert.IsInstanceOfType(getRes, typeof(OkObjectResult));
            var got = ((OkObjectResult)getRes).Value as Schedules;
            Assert.IsNotNull(got);
            Assert.AreEqual("ChainSched", got.ScheduleInfo);

            // Update
            var updated = new Schedules { ScheduleId = created.ScheduleId, TemplateId = created.TemplateId, ScheduleInfo = "ChainSchedUpdated" };
            var putRes = await controller.Put(created.ScheduleId, updated);
            Assert.IsInstanceOfType(putRes, typeof(OkObjectResult));
            var dbval = await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == created.ScheduleId);
            Assert.IsNotNull(dbval);
            Assert.AreEqual("ChainSchedUpdated", dbval.ScheduleInfo);

            // Delete
            var delRes = await controller.Delete(created.ScheduleId);
            Assert.IsInstanceOfType(delRes, typeof(OkObjectResult));
            var deleted = await db.Context.Schedules.FirstOrDefaultAsync(s => s.ScheduleId == created.ScheduleId);
            Assert.IsNull(deleted);
        }
    }
}