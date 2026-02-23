using System;
using System.Collections.Generic;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BackendProjekt.Model;
using BackendProjekt.Auth;

namespace BrckETTAPI.test
{
    public sealed class TestDb : IDisposable
    {
        public Context Context { get; }
        private readonly SqliteConnection _conn;

        public TestDb(Context ctx, SqliteConnection conn)
        {
            Context = ctx;
            _conn = conn;
        }

        public void Dispose()
        {
            Context.Dispose();
            _conn.Close();
            _conn.Dispose();
        }
    }

    public static class TestHelpers
    {
        public static TestDb CreateTestDb(Action<Context>? seed = null)
        {
            var conn = new SqliteConnection("DataSource=:memory:");
            conn.Open();
            var options = new DbContextOptionsBuilder<Context>()
                .UseSqlite(conn)
                .Options;

            var ctx = new Context(options);
            ctx.Database.EnsureCreated();

            seed?.Invoke(ctx);
            ctx.SaveChanges();

            return new TestDb(ctx, conn);
        }

        public static TokenManager CreateTokenManager()
        {
            var init = new Dictionary<string, string>
            {
                ["Auth:JWT:Key"] = "test-key-which-is-long-enough-1234567890",
                ["Auth:JWT:Issuer"] = "test-issuer",
                ["Auth:JWT:Audience"] = "test-audience",
                // minimal role mapping so TokenManager ctor won't fail
                ["Auth:Roles:admin:0"] = "Users.Read"
            };
            var config = new ConfigurationManager();
            config.AddInMemoryCollection(init);
            return new TokenManager(config);
        }
    }
}