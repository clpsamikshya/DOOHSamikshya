using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Inv
{
    public class ScreenService(IDataAccessService da) : IScreenService
    {
     
        public async Task<List<Screen>?> GetScreen(ScreenFilter filter)
        {
            string json = JsonConvert.SerializeObject(new
            {
                filter.Search,
                filter.Status,
                filter.Orientation
            });
            string result = await da.RetrievalProcedure("inv.SpScreenSel", json);
            return JsonConvert.DeserializeObject<List<Screen>>(result);
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

        public async Task<Screen?> DeleteScreen(int id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { ScreenId = id, TenantId = 1, DeletedBy = 1 });
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
            string result = await da.RetrievalProcedure("inv.SpScreenDropDownSel", null);
            return JsonConvert.DeserializeObject<List<Screen>>(result);
        }
    }
}