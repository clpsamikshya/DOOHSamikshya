using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Model.Application.Dbo;
using DoohSamikshya.Model.Shared;
using Microsoft.AspNetCore.Mvc;

namespace DoohSamikshya.API.Controllers.Application.Dbo
{
    public class CampaignMediaController(ICampaignMediaService cms) : SharedController
    {
        [HttpGet]
        public async Task<IActionResult> GetCampaignMedia(
            [FromQuery] int campaignId,
            [FromQuery] int? screenId = null,
            [FromQuery] DateTime? playDate = null,
            [FromQuery] int offset = 0,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var filter = new CampaignMediaFilter
                {
                    CampaignId = campaignId,
                    ScreenId = screenId,
                    PlayDate = playDate,
                    Offset = offset,
                    PageSize = pageSize
                };
                var response = await cms.GetCampaignMedia(filter);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddCampaignMedia([FromBody] CampaignMediaRequest request)
        {
            try
            {
                var response = await cms.AddCampaignMedia (request);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCampaignMedia([FromRoute] int id, [FromQuery] int deletedBy)
        {
            try
            {
                var result = await cms.DeleteCampaignMedia(id, deletedBy);
                return Ok(ApiResponse.Success(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCampaignMedia([FromBody] CampaignMediaRequest request)
        {
            try
            {
                var response = await cms.UpdateCampaignMedia(request);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

    }
}
