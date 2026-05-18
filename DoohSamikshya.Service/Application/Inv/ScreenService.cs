using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using DoohSamikshya.Model.Shared;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Inv
{
    public class ScreenService(IDataAccessService da) : IScreenService
    {
        public async Task<MvScreenResponse?> GetScreen(MvParamReqOption<MvScreenFilter> param)
        {
            string json = JsonConvert.SerializeObject(param);

            string result = await da.RetrievalProcedure("inv.SpScreenSel", json);

            return JsonConvert.DeserializeObject<MvScreenResponse>(result);
        }

        public async Task<List<MvScreen>?> AddScreen(MvScreen screen)
        {
            try
            {
                if (screen.TagList?.Count > 0)
                    screen.Tag = string.Join(",", screen.TagList.Select(t => t.Trim()));

                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("inv.SpScreenIns", json);
                return JsonConvert.DeserializeObject<List<MvScreen>>(result);
            }
            catch (SqlException ex) { throw new Exception(ex.Message); }
        }

        public async Task<List<MvScreen>?> UpdateScreen(MvScreen screen)
        {
            try
            {
                if (screen.TagList?.Count > 0)
                    screen.Tag = string.Join(",", screen.TagList.Select(t => t.Trim()));

                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("[inv].[SpScreenTsk]", json);
                return JsonConvert.DeserializeObject<List<MvScreen>>(result);
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

        public async Task<MvScreen?> DeleteScreen(int id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    ScreenId = id,
                    TenantId = 1,
                    DeletedBy = 1,
                    //CascadeDelete = cascadeDelete
                });
                string result = await da.ActionProcedure("inv.SpScreenDel", json);
                return JsonConvert.DeserializeObject<MvScreen>(result);
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

        public async Task<List<MvScreen>?> GetDropDown(int? campaignId)
        {
            var json = JsonConvert.SerializeObject(new
            {
                CampaignId = campaignId
            });

            string result = await da.RetrievalProcedure("[inv].[SpScreenDdlSel]", json);

            return JsonConvert.DeserializeObject<List<MvScreen>>(result);
        }
    }
}