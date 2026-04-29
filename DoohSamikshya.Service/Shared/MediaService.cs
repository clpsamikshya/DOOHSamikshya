using DoohSamikshya.Interface.Shared;
using DoohSamikshya.Model.Shared;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using Xabe.FFmpeg; 

namespace DoohSamikshya.Service.Shared
{
    public class MediaService(string webRootPath) : IMediaService
    {
        private const long MaxImageSizeBytes = 10L * 1024 * 1024;   // 10 MB
        private const long MaxVideoSizeBytes = 500L * 1024 * 1024;  // 500 MB
        private const string ImageFolder = "Media/Images";
        private const string VideoFolder = "Media/Videos";

        private static readonly HashSet<string> AllowedImageExtensions =
            new(StringComparer.OrdinalIgnoreCase)
            { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        private static readonly HashSet<string> AllowedVideoExtensions =
            new(StringComparer.OrdinalIgnoreCase)
            { ".mp4", ".webm", ".mov", ".avi" };

        public async Task<MediaUploadResult> UploadAsync(MediaUploadParam param)
        {
            // 1. Validate
            ValidateFile(param.File, out var isVideo, out var extension);

            // 2. Generate safe filename & paths
            var fileName = GenerateSafeFileName(extension);
            var folder = isVideo ? VideoFolder : ImageFolder;
            var savePath = Path.Combine(webRootPath, folder, fileName);

            Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);

            // 3. Save file
            try
            {
                await using var stream = new FileStream(
                    savePath, FileMode.Create, FileAccess.Write,
                    FileShare.None, bufferSize: 81920, useAsync: true);

                await param.File.CopyToAsync(stream);
            }
            catch (IOException ex)
            {
                throw new InvalidOperationException(
                    $"Failed to save '{fileName}': {ex.Message}", ex);
            }

            // 4. Extract metadata AFTER save (file must exist on disk)
            var (resolution, duration) = isVideo
                ? await ExtractVideoMetadataAsync(savePath)
                : ExtractImageMetadata(savePath);

            return new MediaUploadResult
            {
                FileName = fileName,
                Url = $"/{folder.Replace("\\", "/")}/{fileName}",
                Extension = extension.TrimStart('.'), // "mp4" not ".mp4"
                IsVideo = isVideo,
                Resolution = resolution,
                Duration = duration
            };
        }

        // ─────────────────────────────────────────────
        private static void ValidateFile(
            IFormFile file, out bool isVideo, out string extension)
        {
            if (file == null || file.Length == 0)
                throw new InvalidOperationException("File is empty or missing.");

            extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(extension))
                throw new InvalidOperationException("File has no extension.");

            isVideo = AllowedVideoExtensions.Contains(extension);
            var isImage = AllowedImageExtensions.Contains(extension);

            if (!isVideo && !isImage)
                throw new InvalidOperationException(
                    $"Extension '{extension}' is not allowed.");

            var maxSize = isVideo ? MaxVideoSizeBytes : MaxImageSizeBytes;
            if (file.Length > maxSize)
                throw new InvalidOperationException(
                    $"File exceeds {maxSize / 1024 / 1024} MB limit.");

            if (!IsContentTypeValid(file.ContentType, isVideo))
                throw new InvalidOperationException(
                    $"Content-Type '{file.ContentType}' doesn't match '{extension}'.");
        }

        private static bool IsContentTypeValid(string contentType, bool isVideo) =>
            !string.IsNullOrWhiteSpace(contentType) && (isVideo
                ? contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
                : contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase));

        private static string GenerateSafeFileName(string extension)
        {
            var ts = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var id = Guid.NewGuid().ToString("N")[..8];
            return $"{ts}_{id}{extension}";
        }

        private static (string resolution, int? duration) ExtractImageMetadata(string path)
        {
            try
            {
                using var image = Image.Load(path);
                return ($"{image.Width}x{image.Height}", null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARN] Image metadata extraction failed: {ex.Message}");
                return ("1920x1080", null);
            }
        }

        private static async Task<(string resolution, int? duration)>
            ExtractVideoMetadataAsync(string filePath)
        {
            try
            {
                // FFmpeg executables auto-downloaded by Xabe.FFmpeg on first run
                var mediaInfo = await FFmpeg.GetMediaInfo(filePath);
                var video = mediaInfo.VideoStreams.FirstOrDefault();

                if (video == null)
                    return ("1920x1080", (int)mediaInfo.Duration.TotalSeconds);

                return (
                    $"{video.Width}x{video.Height}",
                    (int)mediaInfo.Duration.TotalSeconds
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WARN] Video metadata extraction failed: {ex.Message}");
                return ("1920x1080", null);
            }
        }
    }
}



//using DoohSamikshya.Interface.Application.Media;
//using DoohSamikshya.Interface.Shared;
//using DoohSamikshya.Model.Application.Media;
//using DoohSamikshya.Model.Shared;


//namespace DoohSamikshya.Service.Shared
//{
//    public class MediaService(string webRootPath) : IMediaService
//    {
//        public async Task<MediaUploadResult> UploadAsync(MediaUploadParam param)
//        {
//            var extension = Path.GetExtension(param.File.FileName).ToLower();
//            var folder = param.IsVideo ? "Media/Videos" : "Media/Images";
//            var fileName = $"{Guid.NewGuid()}{extension}";
//            var savePath = Path.Combine(webRootPath, folder, fileName);

//            Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);

//            using var stream = new FileStream(savePath, FileMode.Create);
//            await param.File.CopyToAsync(stream);

//            return new MediaUploadResult
//            {
//                FileName = fileName,
//                Url = $"/{folder}/{fileName}"
//            };
//        }
//    }
//}

