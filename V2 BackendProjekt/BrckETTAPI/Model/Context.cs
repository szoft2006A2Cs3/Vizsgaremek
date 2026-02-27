using Microsoft.EntityFrameworkCore;
namespace BackendProjekt.Model
{
    public class Context : DbContext
    {
        public DbSet<Blocks> Blocks { get; set; }
        public DbSet<TemplatesBlocksConn> TemplatesBlocksConns { get; set; }
        public DbSet<Groups> Groups { get; set; }
        public DbSet<Groupscheduleconn> Groupscheduleconns { get; set; }
        public DbSet<Groupuserconn> Groupuserconns { get; set; }
        public DbSet<Schedules> Schedules { get; set; }
        public DbSet<Schedulesusersconn> Schedulesusersconns { get; set; }
        public DbSet<Templates> Templates { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Usersettings> Usersettings { get; set; }

        public Context(DbContextOptions<Context> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //modelBuilder.Entity<Groups>().ToTable("groups");
            //modelBuilder.Entity<Groupscheduleconn>().ToTable("groupscheduleconn");
            //modelBuilder.Entity<Groupuserconn>().ToTable("groupuserconn");
            //modelBuilder.Entity<Schedules>().ToTable("schedules");
            //modelBuilder.Entity<Schedulesusersconn>().ToTable("Scheduleusersconn");
            //modelBuilder.Entity<Templates>().ToTable("templates");
            //modelBuilder.Entity<Users>().ToTable("users");
            //modelBuilder.Entity<Usersettings>().ToTable("usersettings");


        }

    }
}
