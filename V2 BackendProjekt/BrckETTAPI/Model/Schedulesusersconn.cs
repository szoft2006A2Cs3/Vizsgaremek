using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Model
{
    [Table("schedulesusersconn")]
    [PrimaryKey(nameof(UserId), nameof(ScheduleId))]
    public class Schedulesusersconn
    {
        [Column("user_id")]
        //[Key]
        public int UserId { get; set; }
        [Column("schedule_id")]
        //[Key]
        public int ScheduleId { get; set; }

        [ForeignKey(nameof(UserId))]
        public Users? Users { get; set; }

        [ForeignKey(nameof(ScheduleId))]
        public Schedules? Schedules { get; set; }
    }
}
