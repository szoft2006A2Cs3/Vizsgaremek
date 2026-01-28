using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BackendProjekt.Model
{
    [Table("schedules")]
    public class Schedules
    {
        [Column("template_id")]
        public int TemplateId { get; set; }
        [Column("schedule_info")]
        public string? ScheduleInfo { get; set; }
        [Column("schedule_id")]
        [Key]
        public int ScheduleId { get; set; }

        public ICollection<Groupscheduleconn>? Groupscheduleconns { get; set; }

        public ICollection<Schedulesusersconn>? Schedulesusersconns { get; set; }

        [ForeignKey(nameof(TemplateId))]
        public Templates? Templates { get; set; }
    }
}
