using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Model
{
    [Table("groupscheduleconn")]
    [PrimaryKey(nameof(GroupId), nameof(ScheduleId))]
    public class Groupscheduleconn
    {
        [Column("group_id")]
        //[Key]
        public int GroupId { get; set; }
        [Column("schedule_id")]
        //[Key]
        public int ScheduleId { get; set; }

        [ForeignKey(nameof(GroupId))]
        public Groups? Groups { get; set; }
        [ForeignKey(nameof(ScheduleId))]
        public Schedules? Schedule { get; set; }    
    }
}
