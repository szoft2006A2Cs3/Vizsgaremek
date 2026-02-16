using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendProjekt.Model
{
    [Table("templates")]
    public class Templates
    {
        [Column("template_id")]
        [Key]
        public int TemplateId {  get; set; }
        [Column("template_info")]
        public string? TemplateInfo { get; set; }

        public ICollection<Schedules>? Schedules { get; set; }
        public ICollection<TemplatesBlocksConn>? TemplatesBlocksConns { get; set; }
    }
}
