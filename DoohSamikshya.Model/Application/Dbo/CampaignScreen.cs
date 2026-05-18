using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DoohSamikshya.Model.Application.Dbo
{
    public class MvCampaignScreen
    {
        public int Id { get; set; }
        public string? ScreenName { get; set; }
        public int CampaignId { get; set; }
        public int ScreenId { get; set; }

        public bool IsDeleted { get; set; }
    }
}
