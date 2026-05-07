using DoohSamikshya.Model.Shared.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Model.Application.Dbo
{
    public class CampaignMedia
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public int ScreenId { get; set; }
        public int MediaId { get; set; }
        public int PlayOrder { get; set; }
        public DateTimeOffset PlayDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int? CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public int? DeletedBy { get; set; }
    }

    public class CampaignMediaResponse
    {
        public int TotalRows { get; set; }
        public List<CampaignMedia>? Data { get; set; }
    }
    public class CampaignMediaFilter
    {
        public int CampaignId { get; set; }
        public int? ScreenId { get; set; }
        public DateTime? PlayDate { get; set; }
        public int Offset { get; set; }
        public int PageSize { get; set; }
    }

}
