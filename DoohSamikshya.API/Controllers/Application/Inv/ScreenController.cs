using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared;
using DoohSamikshya.Model.Shared.Enum;
using DoohSamikshya.Service.Application.Inv;
using Microsoft.AspNetCore.Mvc;


namespace DoohSamikshya.API.Controllers.Application.Inv
{

    public class ScreenController(IScreenService ss) : SharedController
    {

        [HttpGet("ddl")]
        public async Task<IActionResult> GetDropDown([FromQuery] int? campaignId)
        {
            try
            {
                var response = await ss.GetDropDown(campaignId);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetScreen(
    [FromQuery] MvParamReqOption<MvScreenFilter> param)
        {
            try
            {
                var response = await ss.GetScreen(param);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddScreen([FromBody] MvScreen screen)
        {
            try
            {
                var response = await ss.AddScreen(screen);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }

        }

        
        [HttpPut]
        public async Task<IActionResult> UpdateScreen([FromBody] MvScreen screen)
        {
            try
            {
                var response = await ss.UpdateScreen(screen);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }

        }


        //[HttpDelete("{id}")]
        //public async Task<IActionResult> DeleteScreen([FromRoute] int id)
        //{
        //    try
        //    {
        //        var result = await ss.DeleteScreen(id);
        //        return Ok(ApiResponse.Success(result));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ApiResponse.Fail(ex.Message));
        //    }
        //}

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteScreen([FromRoute] int id)
        {
            try
            {
                var result = await ss.DeleteScreen(id);
                return Ok(ApiResponse.Success(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpDelete("operating-hour/{id}")]
        public async Task<IActionResult> DeleteOperatingHour(
            [FromRoute] int id,
            [FromQuery] int screenId)
        {
            try
            {
                var result = await ss.DeleteOperatingHour(id, screenId, deletedBy: 1);
                return Ok(ApiResponse.Success(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

    }
}
