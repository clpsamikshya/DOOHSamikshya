using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Model.Application.Media;
using DoohSamikshya.Model.Shared;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;

namespace DoohSamikshya.Service.Application.Media
{
    public class MediaLibraryService(IDataAccessService da) : IMediaLibraryService
    {
        private const string FfprobePath = @"C:\Users\khati\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffprobe.exe";

        private static readonly HashSet<string> VideoExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            "mp4", "avi", "mov", "mkv", "wmv", "flv", "webm"
        };

        private static readonly HashSet<string> ImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"
        };

        public async Task<List<MvMediaLibrary>> AddMediaLibrary(MvInsertMedia request)
        {
            try
            {
                // 1. Auto-detect extension from uploaded file
                string ext = Path.GetExtension(request.File.FileName)?.TrimStart('.').ToLower()
                             ?? throw new Exception("Could not determine file extension.");

                // 2. Validate supported file type
                if (!VideoExtensions.Contains(ext) && !ImageExtensions.Contains(ext))
                    throw new Exception($"Unsupported file type: .{ext}");

                // 3. Auto-detect IsVideo — never trust frontend
                bool isVideo = VideoExtensions.Contains(ext);

                // 4. Auto-extract duration from backend using ffprobe
                int? duration = null;
                if (isVideo)
                {
                    var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.{ext}");
                    try
                    {
                        await using (var stream = new FileStream(tempPath, FileMode.Create))
                        {
                            await request.File.CopyToAsync(stream);
                        }

                        if (!File.Exists(FfprobePath))
                            throw new Exception($"ffprobe not found at: {FfprobePath}");

                        var process = new System.Diagnostics.Process
                        {
                            StartInfo = new System.Diagnostics.ProcessStartInfo
                            {
                                FileName = FfprobePath,
                                Arguments = $"-v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \"{tempPath}\"",
                                RedirectStandardOutput = true,
                                RedirectStandardError = true,
                                UseShellExecute = false,
                                CreateNoWindow = true
                            }
                        };

                        process.Start();
                        string output = await process.StandardOutput.ReadToEndAsync();
                        await process.WaitForExitAsync();

                        if (double.TryParse(
                                output.Trim(),
                                System.Globalization.NumberStyles.Any,
                                System.Globalization.CultureInfo.InvariantCulture,
                                out double seconds))
                        {
                            duration = (int)Math.Ceiling(seconds);
                        }
                        else
                        {
                            throw new Exception("Could not extract video duration.");
                        }
                    }
                    finally
                    {
                        if (File.Exists(tempPath))
                            File.Delete(tempPath);
                    }
                }

                string name = string.IsNullOrWhiteSpace(request.Name)
                    ? Path.GetFileNameWithoutExtension(request.File.FileName)
                    : request.Name;

                var param = new
                {
                    TenantId = 1,
                    Name = name,
                    Url = request.Url,
                    Extension = ext,
                    IsVideo = isVideo,
                    Resolution = request.Resolution ?? "1920x1080",
                    Duration = duration,
                    CreatedBy = request.CreatedBy
                };

                string json = JsonConvert.SerializeObject(param);
                string result = await da.ActionProcedure("[dbo].[SpMediaLibraryIns]", json);
                return JsonConvert.DeserializeObject<List<MvMediaLibrary>>(result)
                       ?? throw new Exception("Insert failed or returned null.");
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<MvMediaLibrary?> DeleteMediaLibrary(int id)
        {
            try
            {
                var payload = new
                {
                    Id = id,
                    TenantId = 1,
                    DeletedBy = 1
                };
                string json = JsonConvert.SerializeObject(payload);
                string result = await da.ActionProcedure("[dbo].[SpMediaLibraryDel]", json);
                return JsonConvert.DeserializeObject<MvMediaLibrary>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<MvDropdownItem>?> GetMediaLibraryDdl(int? campaignId = null)
        {
            try
            {
                string json = JsonConvert.SerializeObject(new
                {
                    CampaignId = campaignId
                });

                string result = await da.RetrievalProcedure("[dbo].[SpMediaLibraryDdlSel]", json);
                return JsonConvert.DeserializeObject<List<MvDropdownItem>>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<MvMediaLibraryResponse?> GetMediaLibrary(MvParamReqOption<MvMediaFilter> param)
        {
            try
            {
                string json = JsonConvert.SerializeObject(param);
                string result = await da.RetrievalProcedure("[dbo].[SpMediaLibrarySel]", json);
                return JsonConvert.DeserializeObject<MvMediaLibraryResponse>(result);
            }
            catch (SqlException ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}