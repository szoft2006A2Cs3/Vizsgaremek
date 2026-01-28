using BackendProjekt.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BrckETTAPI.test
{
    internal class DBContextHelper
    {

        public static Context CreateDbContext() 
        {
            var options = new Microsoft.EntityFrameworkCore.DbContextOptionsBuilder<Context>()
                .UseInMemoryDatabase("TestDb")
                .Options;

            var context = new Context(options);
            context.Users.AddRange(
                new Users { UserId = 1, Username = "testuser1", Password = "password1" },
                new Users { UserId = 2, Username = "testuser2", Password = "password2" }
            );
        }
    }
}
