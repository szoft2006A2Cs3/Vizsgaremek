using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendProjekt.Model
{
    [Table("usersettings")]
    public class Usersettings
    {
        [Column("user_id")]
        [Key]
        public int UserId { get; set; }
        [Column("settings")]
        public string? Settings { get; set; }

        [ForeignKey(nameof(UserId))]
        public Users? User { get; set; }
    }
}
