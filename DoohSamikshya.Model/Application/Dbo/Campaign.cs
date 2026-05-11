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

         [Required]
          public string Name { get; set; }
          public CampaignStatus Status { get; set; } = CampaignStatus.New;
          public int DurationInDays { get; set; }
          public string? Remarks { get; set; }
         public bool IsDeleted { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int? CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public int? DeletedBy { get; set; }
        public List<CampaignDate> Date { get; set; } = new();
        public List<CampaignScreen> Screen { get; set; } = new();
        
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
}
