using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BackendProjekt.Model
{
    [Table("groupuserconn")]
    [PrimaryKey(nameof(UserId), nameof(GroupId))]
    public class Groupuserconn
    {
        [Column("user_Id")]
        //[Key]
        public int UserId { get; set; }
        [Column("group_Id")]
        //[Key]
        public int GroupId { get; set; }
        [Column("permission")]
        public string? Permission { get; set; }

        [ForeignKey(nameof(GroupId))]
        public Groups? Group { get; set; }

        [ForeignKey(nameof(UserId))]
        public Users? User { get; set; }
    }
}
