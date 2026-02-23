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
    public class BlocksControllerTests
    {
        [TestMethod]
        public async Task GetAll_Returns_List_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Blocks.Add(new Blocks { BlockId = 1, Title = "A", TimeStart = 0, TimeEnd = 1 });
                ctx.Blocks.Add(new Blocks { BlockId = 2, Title = "B", TimeStart = 0, TimeEnd = 1 });
            });

            var controller = new BlocksController(db.Context);
            var result = await controller.Get();
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var ok = (OkObjectResult)result;
            var list = ok.Value as System.Collections.Generic.IEnumerable<Blocks>;
            Assert.IsNotNull(list);
            Assert.AreEqual(2, list.Count());
        }

        [TestMethod]
        public async Task GetById_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new BlocksController(db.Context);
            var result = await controller.Get(999);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task GetById_Found_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Blocks.Add(new Blocks { BlockId = 10, Title = "Found", TimeStart = 0, TimeEnd = 1 });
            });
            var controller = new BlocksController(db.Context);
            var result = await controller.Get(10);
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var value = ((OkObjectResult)result).Value as Blocks;
            Assert.IsNotNull(value);
            Assert.AreEqual(10, value.BlockId);
        }

        [TestMethod]
        public async Task Post_Create_Pass()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new BlocksController(db.Context);
            var newBlock = new Blocks { BlockId = 55, Title = "New", TimeStart = 0, TimeEnd = 1 };
            var result = await controller.Post(newBlock);
            Assert.IsInstanceOfType(result, typeof(CreatedResult));
            var inserted = await db.Context.Blocks.FirstOrDefaultAsync(b => b.BlockId == 55);
            Assert.IsNotNull(inserted);
        }

        [TestMethod]
        public async Task Put_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new BlocksController(db.Context);
            var update = new Blocks { BlockId = 999, Title = "X", TimeStart = 0, TimeEnd = 1 };
            var result = await controller.Put(999, update);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Put_Update_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Blocks.Add(new Blocks { BlockId = 5, Title = "Old", TimeStart = 10, TimeEnd = 20 });
            });
            var controller = new BlocksController(db.Context);
            var updated = new Blocks { BlockId = 5, Title = "Updated", TimeStart = 30, TimeEnd = 40 };
            var result = await controller.Put(5, updated);
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var dbval = await db.Context.Blocks.FirstOrDefaultAsync(b => b.BlockId == 5);
            Assert.IsNotNull(dbval);
            Assert.AreEqual("Updated", dbval.Title);
            Assert.AreEqual(30, dbval.TimeStart);
        }

        [TestMethod]
        public async Task Delete_NotFound_Fail()
        {
            using var db = TestHelpers.CreateTestDb();
            var controller = new BlocksController(db.Context);
            var result = await controller.Delete(12345);
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
        }

        [TestMethod]
        public async Task Delete_Pass()
        {
            using var db = TestHelpers.CreateTestDb(ctx =>
            {
                ctx.Blocks.Add(new Blocks { BlockId = 77, Title = "Todelete", TimeStart = 0, TimeEnd = 1 });
            });
            var controller = new BlocksController(db.Context);
            var result = await controller.Delete(77);
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            var deleted = await db.Context.Blocks.FirstOrDefaultAsync(b => b.BlockId == 77);
            Assert.IsNull(deleted);
        }
    }
}