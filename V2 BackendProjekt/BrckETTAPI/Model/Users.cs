using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendProjekt.Model
{
    [Table("users")]
    public class Users
    {
        [Column("user_id")]
        [Key]
        public int UserId { get; set; }
        [Column("username")]
        public required string UserName { get; set; }
        [Column("email")]
        public required string Email { get; set; }
        [Column("display_name")]
        public string? DisplayName { get; set; }
        [Column("PASSWORD")]
        public required string Password { get; set; }
        [Column("Role")]
        public string? Role { get; set; }

        public string? Token { get; set; }
    }
}
