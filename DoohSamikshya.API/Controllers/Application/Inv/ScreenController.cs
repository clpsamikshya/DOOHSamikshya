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
       
        [HttpGet("DD")]
        public async Task<IActionResult> DropDown()
        {
            try
            {
                var response = await ss.DropDown();
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetScreen(
    [FromQuery] string? search,
    [FromQuery] ScreenStatus? status,
    [FromQuery] ScreenOrientation? orientation,
    [FromQuery] int offset = 0,        
    [FromQuery] int pageSize = 10)
        {
            try
            {
                var filter = new ScreenFilter
                {
                    Search = search,
                    Status = status,
                    Orientation = orientation,
                    Offset = offset,
                    PageSize = pageSize
                };
                var response = await ss.GetScreen(filter);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddScreens([FromBody] Screen screen)
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
        public async Task<IActionResult> UpdateScreens([FromBody] Screen screen)
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
