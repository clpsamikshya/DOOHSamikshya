using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Model.Application.Media
{

    public class MvMediaLibrary
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string? Url { get; set; } = null!;
        public string? Resolution { get; set; } = "1920x1080";
        public string? Extension { get; set; } = null!;
        public int? Duration { get; set; }
        public bool IsVideo { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int CreatedBy { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
    }

}
