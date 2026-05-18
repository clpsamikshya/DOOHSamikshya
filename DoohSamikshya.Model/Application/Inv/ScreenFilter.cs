using DoohSamikshya.Model.Shared.Enum;

namespace DoohSamikshya.Model.Application.Inv
{
    public class MvScreenFilter
    {
        public string? Search { get; set; }
        public ScreenStatus? Status { get; set; }
        public ScreenOrientation? Orientation { get; set; }
        
    }
}

