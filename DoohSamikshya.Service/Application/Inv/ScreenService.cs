using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Model.Application.Inv;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Inv
{
    public class ScreenService(IDataAccessService da) : IScreenService
    {

        #region 
        public async Task<List<Screen>?> GetScreenById(int Id)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new { Id });
                string result = await da.RetrievalProcedure("core.SpScreenByIdSel", json);
                return JsonConvert.DeserializeObject<List<Screen>>(result);
            }
            catch (Exception )
            {
                throw;
            }

        }

        #endregion


        #region
        public async Task<List<Screen>?> GetScreen(string? name, bool? isActive)
        {
            string json = JsonConvert.SerializeObject(new { Name = name, IsActive = isActive });
            string result = await da.RetrievalProcedure("inv.SpScreenSel", json);
            return JsonConvert.DeserializeObject<List<Screen>>(result);
        }

        #endregion

        #region

        public async Task<List<Screen>?> AddScreen(Screen screen)
        {
            try
            {
                // Fix Tag from TagList
                if (screen.TagList != null && screen.TagList.Count > 0)
                {
                    screen.Tag = string.Join(",", screen.TagList.Select(t => t.Trim()));
                }

                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("inv.SpScreenIns", json);
                return JsonConvert.DeserializeObject<List<Screen>>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion

        //public async Task<List<Screen>?> Upsert(List<Screen> screens)
        //{
        //    string json = JsonConvert.SerializeObject(screens);
        //    string result = await da.ActionProcedure("inv.SpScreenTsk", json);
        //    return JsonConvert.DeserializeObject<List<Screen>>(result);
        //}

        #region
        public async Task<List<Screen>?> UpdateScreen(Screen screen)
        {

            try
            {
                string json = JsonConvert.SerializeObject(screen);
                string result = await da.ActionProcedure("inv.SpScreenUpd", json);
                return JsonConvert.DeserializeObject<List<Screen>>(result);
            }

            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion

        #region

        public async Task<Screen?> DeleteScreen(int id, bool cascade = true)
        {
            var payload = new
            {
                ScreenId = id,
                DeletedBy = 1,
                CascadeDelete = cascade
            };

            string json = JsonConvert.SerializeObject(payload);

            string result = await da.ActionProcedure("inv.SpScreenDel", json);

            return JsonConvert.DeserializeObject<Screen>(result);
        }

        //public async Task<Screen?> DeleteScreen(int id, bool cascade = true)
        //{
        //    try
        //    {
        //        string json = JsonConvert.SerializeObject(new { ScreenId = id, Cascade = cascade });
        //        string result = await da.ActionProcedure("inv.SpScreenDel", json);
        //        return JsonConvert.DeserializeObject<Screen>(result);
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }

        //}

        public async Task<List<Screen>?> DropDown()
        {
            string result = await da.RetrievalProcedure("inv.SpScreenDropDownSel", null);
            return JsonConvert.DeserializeObject<List<Screen>>(result);
        }

        #endregion

    }
}
