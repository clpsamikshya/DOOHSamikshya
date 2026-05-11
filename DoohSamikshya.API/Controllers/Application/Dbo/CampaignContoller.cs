using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DoohSamikshya.API.Controllers.Application.Dbo
{
    public class CampaignContoller(ICampaignService cs) : SharedController
    {
        [HttpGet]
        public async Task<IActionResult> GetCampaign(
    [FromQuery] string? Search,
    [FromQuery] int? CampaignId,   
    [FromQuery] int OffSet = 0,
    [FromQuery] int PageSize = 10)
        {
            try
            {
                var filter = new CampaignFilter
                {
                    Search = Search,
                    CampaignId = CampaignId,   
                    Offset = OffSet,
                    PageSize = PageSize
                };
                var response = await cs.GetCampaign(filter);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddCampaign([FromBody] Campaign campaign)
        {
            try
            {
                var response = await cs.AddCampaign(campaign);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> Deletecampaign([FromRoute] int Id)
        {
            try
            {
                var result = await cs.DeleteCampaign(Id);
                return Ok(ApiResponse.Success(result));
            }
            catch(Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
    }
}
