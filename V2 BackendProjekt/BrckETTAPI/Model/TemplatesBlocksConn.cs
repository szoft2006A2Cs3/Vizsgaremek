using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BackendProjekt.Model
{
    [PrimaryKey(nameof(TemplateId), nameof(BlockId))]
    [Table("templatesblocksconn")]
    public class TemplatesBlocksConn
    {
        [Column("template_id")]
        public int TemplateId { get; set; }
        [Column("block_id")]
        public int BlockId { get; set; }

        [ForeignKey(nameof(TemplateId))]
        public Templates? Templates { get; set; }

        [ForeignKey(nameof(BlockId))]
        public Blocks? Blocks { get; set; }
    }
}
