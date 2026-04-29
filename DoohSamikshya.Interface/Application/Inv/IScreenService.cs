using DoohSamikshya.Model.Application.Inv;


namespace DoohSamikshya.Interface.Application.Inv
{
    public interface IScreenService
    {
       Task<List<Screen>?> GetScreenById(int id);
        //Task<Screen?> GetScreenById(int Id);

       Task<List<Screen>?> GetScreen(string? name, bool? isActive);

       Task<List<Screen>?> AddScreen(Screen screen);

       Task<List<Screen>?> UpdateScreen(Screen screen);

     //Task<List<Screen>?> Upsert(List<Screen> screens);

        Task<List<Screen>?> DropDown();

        Task<Screen?> DeleteScreen(int id, bool cascade = true);
    }
}
