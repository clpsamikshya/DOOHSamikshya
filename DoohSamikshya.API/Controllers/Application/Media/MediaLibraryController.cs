using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Interface.Shared;
using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Application.Media;
using DoohSamikshya.Model.Shared;
using DoohSamikshya.Model.Shared.Enum;
using Microsoft.AspNetCore.Mvc;

namespace DoohSamikshya.API.Controllers.Application.Media
{
    public class MediaLibraryController(
        IMediaLibraryService mls,
        IMediaService ms) : SharedController
    {
        [HttpGet]
        public async Task<IActionResult> GetMediaLibrary([FromQuery] string? search, [FromQuery] bool? IsVideo)
        {
            try
            {
                var filter = new MediaFilter
                {
                    Search = search,
                    IsVideo = IsVideo
                    
                };
                var response = await mls.GetMediaLibrary(filter);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }



        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> InsertMedia([FromForm] InsertMedia request)
        {
            try
            {
               
                var uploaded = await ms.UploadAsync(new MediaUploadParam
                {
                    File = request.File
                });

                var baseUrl = $"{Request.Scheme}://{Request.Host}";

              
                request.Name = Path.GetFileNameWithoutExtension(request.File.FileName);
                request.Url = $"{baseUrl}{uploaded.Url}";
                request.Extension = uploaded.Extension; 
                request.IsVideo = uploaded.IsVideo;
                request.Resolution = uploaded.Resolution; 
                request.Duration = uploaded.Duration; 
                request.TenantId = 1;
                request.CreatedBy = 1;

                var response = await mls.AddMediaLibrary(request);
                return Ok(ApiResponse.Success(response));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
            //catch (Exception ex)
            //{
            //    Console.WriteLine($"[ERROR] {ex}");
            //    return StatusCode(500, ApiResponse.Fail(ex.Message));
            //}
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMediaLibrary([FromRoute] int id)
        {
            try
            {
                var response = await mls.DeleteMediaLibrary(id);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
    }
}