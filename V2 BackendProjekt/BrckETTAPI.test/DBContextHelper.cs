using BackendProjekt.Model;
using Microsoft.EntityFrameworkCore;
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
                new Users { UserId = 1, UserName = "testuser1", Password = "password1", Email="IDK@gmail.com"},
                new Users { UserId = 2, UserName = "testuser2", Password = "password2", Email = "IDK2@gmail.com" },
                new Users { UserId = 3, UserName = "testuser3", Password = "password3", Email = "IDK3@gmail.com" }
            );


            context.SaveChanges();
            return context;
        }
    }
}
