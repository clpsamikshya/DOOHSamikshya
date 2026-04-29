using DoohSamikshya.API.Controllers.Shared;
using DoohSamikshya.Interface.Application.Core;
using DoohSamikshya.Model.Application.Core;
using DoohSamikshya.Model.Shared;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;

namespace DoohSamikshya.API.Controllers.Application.Core
{
    public class TenantController(ITenantService ts) : SharedController
    {
       
        [HttpGet]
        public async Task<IActionResult> GetTenant()
        {
            try
            {
                var response = await ts.GetTenant();
                return Ok(ApiResponse.Success(response));

            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
       

        [HttpGet("ByFilter")]
        public async Task<IActionResult> GetTenantByFilter([FromQuery] int offset, [FromQuery] int pageSize, [FromQuery] string? name, [FromQuery] bool? isActive)
        {
            try
            {
                var response = await ts.GetTenantByFilter(offset, pageSize, name, isActive);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> AddTenant([FromBody] Tenant tenant)
        {
            try
            {
                var response = await ts.AddTenant(tenant);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
           

        }
       
        [HttpPut]
            public async Task<IActionResult> UpdateTenant([FromBody] Tenant tenant)
            {
                try
                {
                    var response = await ts.UpdateTenant(tenant);
                    return Ok(ApiResponse.Success(response));
                }
                catch (Exception ex)
                {
                return BadRequest(ApiResponse.Fail(ex.Message));
                }
            }

       
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteTenant([FromRoute] int Id, [FromQuery] bool cascade = true)
        {
            try
            {
                var response = await ts.DeleteTenant(Id, cascade);
                return Ok(ApiResponse.Success(response));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }
       

    }
}

