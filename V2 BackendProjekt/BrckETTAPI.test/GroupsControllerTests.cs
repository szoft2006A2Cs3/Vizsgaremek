using System.Threading.Tasks;
using BackendProjekt.Controllers;
using BackendProjekt.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BrckETTAPI.test
{
    [TestClass]
    public class GroupsControllerTests
    {
        [TestMethod]
        public async Task GetAll_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Groups.Add(new Groups { GroupId = 1, GroupName = "G1" });
            });
            var controller = new GroupsController(db.Context);
            var res = await controller.Get();
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }

        [TestMethod]
        public async Task GetById_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new GroupsController(db.Context);
            var res = await controller.Get(999);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        // NEW: positive test for Get(id)
        [TestMethod]
        public async Task GetById_Found_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Groups.Add(new Groups { GroupId = 3, GroupName = "G3" });
            });

            var controller = new GroupsController(db.Context);
            var res = await controller.Get(3);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var group = ((OkObjectResult)res).Value as Groups;
            Assert.IsNotNull(group);
            Assert.AreEqual("G3", group.GroupName);
        }

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new GroupsController(db.Context);
            var res = await controller.Post(new Groups { GroupName = "NewGroup" });
            Assert.IsInstanceOfType(res, typeof(CreatedAtActionResult));
        }

        [TestMethod]
        public async Task Put_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new GroupsController(db.Context);
            var res = await controller.Put(999, new Groups { GroupName = "X" });
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Put_Update_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Groups.Add(new Groups { GroupId = 10, GroupName = "Old" });
            });
            var controller = new GroupsController(db.Context);
            var res = await controller.Put(10, new Groups { GroupName = "Updated" });
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
            var dbg = await db.Context.Groups.FirstOrDefaultAsync(g => g.GroupId == 10);
            Assert.IsNotNull(dbg);
            Assert.AreEqual("Updated", dbg.GroupName);
        }

        [TestMethod]
        public async Task Delete_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new GroupsController(db.Context);
            var res = await controller.Delete(999);
            Assert.IsInstanceOfType(res, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Delete_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Groups.Add(new Groups { GroupId = 20, GroupName = "ToDelete" });
            });
            var controller = new GroupsController(db.Context);
            var res = await controller.Delete(20);
            Assert.IsInstanceOfType(res, typeof(OkObjectResult));
        }

        // Chain test: Create -> Get -> Update -> Delete
        [TestMethod]
        public async Task Groups_Chain_CRUD_Pass()
        {
            using var db = TestHelpers.CreateTestDb();

            var controller = new GroupsController(db.Context);

            // Create
            var toCreate = new Groups { GroupName = "ChainGroup" };
            var postRes = await controller.Post(toCreate);
            Assert.IsInstanceOfType(postRes, typeof(CreatedAtActionResult));

            var created = await db.Context.Groups.FirstOrDefaultAsync(g => g.GroupName == "ChainGroup");
            Assert.IsNotNull(created);

            // Get
            var getRes = await controller.Get(created.GroupId);
            Assert.IsInstanceOfType(getRes, typeof(OkObjectResult));
            var got = ((OkObjectResult)getRes).Value as Groups;
            Assert.IsNotNull(got);
            Assert.AreEqual("ChainGroup", got.GroupName);

            // Update
            var updated = new Groups { GroupName = "ChainGroupUpdated" };
            var putRes = await controller.Put(created.GroupId, updated);
            Assert.IsInstanceOfType(putRes, typeof(OkObjectResult));

            var dbval = await db.Context.Groups.FirstOrDefaultAsync(g => g.GroupId == created.GroupId);
            Assert.IsNotNull(dbval);
            Assert.AreEqual("ChainGroupUpdated", dbval.GroupName);

            // Delete
            var delRes = await controller.Delete(created.GroupId);
            Assert.IsInstanceOfType(delRes, typeof(OkObjectResult));
            var deleted = await db.Context.Groups.FirstOrDefaultAsync(g => g.GroupId == created.GroupId);
            Assert.IsNull(deleted);
        }
    }
}