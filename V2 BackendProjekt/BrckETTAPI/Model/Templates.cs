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
    }
}
