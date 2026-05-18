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
    [FromQuery] MvParamReqOption<MvCampaignFilter> param)
        {
            try
            {
                var response = await cs.GetCampaign(param);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddCampaign([FromBody] MvCampaign campaign)
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
