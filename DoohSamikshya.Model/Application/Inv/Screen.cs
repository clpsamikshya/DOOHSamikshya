using DoohSamikshya.Model.Shared.Enum;
using System.Text.Json.Serialization;

namespace DoohSamikshya.Model.Application.Inv
{
    public class Screen
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string Name { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string Resolution { get; set; } = "1920x1080";
        public string? ResolutionName { get; set; }

        [JsonIgnore]
        public string? Tag { get; set; }

        [JsonPropertyName("tag")]
        public List<string>? TagList
        {
            get
            {
                if (string.IsNullOrWhiteSpace(Tag)) return new List<string>();
                return Tag.Split(',', StringSplitOptions.RemoveEmptyEntries)
                          .Select(t => t.Trim())
                          .ToList();
            }
            set
            {
                if (value == null || value.Count == 0)
                    Tag = null;
                else
                    Tag = string.Join(",", value.Select(t => t.Trim()));
            }
        }

        public ScreenOrientation Orientation { get; set; } = ScreenOrientation.Landscape;
        public string? OrientationName { get; set; }
        public ScreenStatus Status { get; set; } = ScreenStatus.Active;
        public string? StatusName { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int? CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public DateTimeOffset? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
        public List<ScreenOperatingHour> OperatingHour { get; set; } = new();
    }

    public class ScreenFilter
    {
        public string? Search { get; set; }
        public ScreenStatus? Status { get; set; }
        public ScreenOrientation? Orientation { get; set; }
        public int Offset { get; set; } = 0;     
        public int PageSize { get; set; } = 10;
    }

    public class ScreenResponse
    {
        public int TotalRows { get; set; }  
        public List<Screen>? Data { get; set; }
    }
}

