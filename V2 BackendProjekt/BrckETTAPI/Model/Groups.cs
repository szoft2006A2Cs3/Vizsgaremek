using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Model
{

    [Table("groups")]
    public class Groups
    { 
        [Column("group_id")]
        [Key]
        public int GroupId { get; set; }

        [Column("group_name")]
        public string? GroupName { get; set; }

        public ICollection<Groupscheduleconn>? Groupscheduleconns { get; set; }

        public ICollection<Groupuserconn>? Groupuserconns { get; set; }

    }
}
