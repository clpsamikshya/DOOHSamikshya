using System.Text.Json.Serialization;

namespace DoohSamikshya.Model.Application.Inv
{
    public class ScreenOperatingHour
    {
        public int Id { get; set; }
        public int ScreenId { get; set; }
        public string StartTime { get; set; } = null!;
        public string EndTime { get; set; } = null!;
        public DayOfWeek DayOfWeek { get; set; }
        public string? DayName { get; set; }
        public int? AvgAudienceCount { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
    }
}