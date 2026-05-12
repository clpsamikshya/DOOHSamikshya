using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Inv
{
    public class ScreenService(IDataAccessService da) : IScreenService
    {
        public async Task<ScreenResponse?> GetScreen(ScreenFilter filter)
        {
            string json = JsonConvert.SerializeObject(new
            {
                Offset = filter.Offset,
                PageSize = filter.PageSize,
                Filter = new
                {
                    TenantId = 1,
                    Search = filter.Search ?? "",
                    Status = filter.Status.HasValue ? (int?)filter.Status.Value : null,
                    Orientation = filter.Orientation.HasValue ? (int?)filter.Orientation.Value : null
                }
            });

            string result = await da.RetrievalProcedure("inv.SpScreenSel", json);


            return JsonConvert.DeserializeObject<ScreenResponse>(result);
        }

        public async Task<List<Screen>?> AddScreen(Screen screen)
        {
            try
            {
                if (screen.TagList?.Count > 0)
                    screen.Tag = string.Join(",", screen.TagList.Select(t => t.Trim()));

                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("inv.SpScreenIns", json);
                return JsonConvert.DeserializeObject<List<Screen>>(result);
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
        }

        public async Task<List<Screen>?> UpdateScreen(Screen screen)
        {
            try
            {
                if (screen.TagList?.Count > 0)
                    screen.Tag = string.Join(",", screen.TagList.Select(t => t.Trim()));

                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("inv.SpScreenUpd", json);
                return JsonConvert.DeserializeObject<List<Screen>>(result);
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
        }

        //public async Task<Screen?> DeleteScreen(int id)
        //{
        //    try
        //    {
        //        string json = JsonConvert.SerializeObject(new { ScreenId = id, TenantId = 1, DeletedBy = 1 });
        //        string result = await da.ActionProcedure("inv.SpScreenDel", json);
        //        return JsonConvert.DeserializeObject<Screen>(result);
        //    }
        //    catch (SqlException ex) { throw new Exception(ex.Message); }
        //}

        public async Task<Screen?> DeleteScreen(int id, bool cascadeDelete)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    ScreenId = id,
                    TenantId = 1,
                    DeletedBy = 1,
                    CascadeDelete = cascadeDelete
                });
                string result = await da.ActionProcedure("inv.SpScreenDel", json);
                return JsonConvert.DeserializeObject<Screen>(result);
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
        }

        public async Task<string> DeleteOperatingHour(int id, int screenId, int deletedBy)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { Id = id, ScreenId = screenId, DeletedBy = deletedBy });
                string result = await da.ActionProcedure("inv.SpScreenOperatingHourDel", json);
                return result;
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
        }

        public async Task<List<Screen>?> DropDown()
        {
            string result = await da.RetrievalProcedure("[inv].[SpScreenDdlSel]", null);
            return JsonConvert.DeserializeObject<List<Screen>>(result);
        }
    }
}