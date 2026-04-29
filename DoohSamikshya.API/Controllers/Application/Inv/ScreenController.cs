using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Core;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared;
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
        public async Task<IActionResult> GetScreen([FromQuery] string? name, [FromQuery] bool? isActive)
        {
            try
            {
                var response = await ss.GetScreen(name, isActive);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
    

        //[HttpPost("Upsert")]
        //public async Task<IActionResult> Upsert([FromBody] List<Screen> screens)
        //{
        //    try
        //    {
        //        var response = await ss.Upsert(screens);
        //        return Ok(ApiResponse.Success(response));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ApiResponse.Fail(ex.Message));
        //    }
        //}

    

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
        public async Task<IActionResult> DeleteScreens(
    [FromRoute] int id,
    [FromQuery] bool cascade = true)
        {
            try
            {
                var response = await ss.DeleteScreen(id, cascade);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        //[HttpDelete("Id")]
        //public async Task<IActionResult> DeleteScreens([FromRoute] int Id,[FromQuery] bool cascade = true)
        //{
        //    try
        //    {
        //        var response = await ss.DeleteScreen(Id, cascade);
        //        return Ok(ApiResponse.Success(response));
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ApiResponse.Fail(ex.Message));
        //    }

        //}






    }
}
