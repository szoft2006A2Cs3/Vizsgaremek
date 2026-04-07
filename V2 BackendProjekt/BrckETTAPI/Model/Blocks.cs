using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendProjekt.Model
{
    public class Blocks
    {
        [Key]
        [Column("block_id")]
        public int BlockId { get; set; }
        [Column("date")]
        public DateTime? Date { get; set; }
        [Column("description")]
        public string? Description { get; set; }
        [Column("priority")]
        public string? Priority { get; set; }
        [Column("timeStart")]
        public int TimeStart { get; set; }
        [Column("timeEnd")]
        public int TimeEnd { get; set; }
        [Column("title")]
        public string? Title { get; set; }
        public ICollection<TemplatesBlocksConn>? TemplatesBlocksConns { get; set; }

    }
}
