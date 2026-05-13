using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Model.Application.Dbo
{
    public class Campaign
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; }
        public CampaignStatus Status { get; set; }
        public int DurationInDays { get; set; }
        public string? Remarks { get; set; }

        public List<CampaignDate> Date { get; set; }
        public List<CampaignScreen> Screen { get; set; }

        public List<CampaignMediaGroup> CampaignMedia { get; set; }
    }

    public class CampaignFilter
    {
        public string? Search { get; set; }
       
        public CampaignStatus? Status { get; set; }
        public int? CampaignId { get; set; }  
        public int Offset { get; set; } = 0;
        public int PageSize { get; set; } = 10;
    }

    public class CampaignResponse
    {
        public int TotalRows { get; set; }
        public List<Campaign>? Data { get; set; }
    }

    public class CampaignMediaGroup
    {
        public int ScreenId { get; set; }
        public string ScreenName { get; set; }

        public DateTime? PlayDate { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int CreatedBy { get; set; }

        public List<MediaItem> Media { get; set; } = new();
    }
}
