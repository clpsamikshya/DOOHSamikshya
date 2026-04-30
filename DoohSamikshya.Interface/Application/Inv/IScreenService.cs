using DoohSamikshya.Model.Application.Inv;

namespace DoohSamikshya.Interface.Application.Inv
{
    public interface IScreenService
    {
        Task<List<Screen>?> GetScreenById(int id);
        Task<List<Screen>?> GetScreen(ScreenFilter filter);
        Task<List<Screen>?> AddScreen(Screen screen);
        Task<List<Screen>?> UpdateScreen(Screen screen);
        Task<List<Screen>?> DropDown();
        Task<Screen?> DeleteScreen(int id);                                         // ← removed cascade, removed duplicate DeleteAsync
        Task<string> DeleteOperatingHour(int id, int screenId, int deletedBy);     // ← new
    }
}