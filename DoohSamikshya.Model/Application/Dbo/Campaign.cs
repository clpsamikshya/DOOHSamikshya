using DoohSamikshya.Model.Shared.Enum;

namespace DoohSamikshya.Model.Application.Dbo
{
    public class MvCampaign
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; }
        public CampaignStatus Status { get; set; }
        public int DurationInDays { get; set; }
        public string? Remarks { get; set; }
        public int CreatedBy { get; set; }
        public List<MvCampaignDate> Date { get; set; }
        public List<MvCampaignScreen> Screen { get; set; }

        public List<MvCampaignMediaGroup>? CampaignMedia { get; set; }
    }

    public class MvCampaignFilter
    {
        public string? Search { get; set; }
       
        public CampaignStatus? Status { get; set; }
        public int? CampaignId { get; set; }  
       
    }

    public class MvCampaignResponse
    {
        public int TotalRows { get; set; }
        public List<MvCampaign>? Data { get; set; }
    }

    public class MvCampaignMediaGroup
    {
        public int ScreenId { get; set; }
        public string ScreenName { get; set; }

        public DateTime? PlayDate { get; set; }
        public string? Url { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int CreatedBy { get; set; }

        public List<MvMediaItem> Media { get; set; } = new();
    }
}
