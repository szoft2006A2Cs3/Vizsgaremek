using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Model
{
    [Table("isignored")]
    [PrimaryKey(nameof(User_Id), nameof(Block_Id))]
    public class isIgnored
    {
        [Column("user_id")]
        public int User_Id { get; set; }
        [Column("block_id")]
        public int Block_Id { get; set; }
    }
}
