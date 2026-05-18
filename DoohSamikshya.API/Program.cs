using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.BackgroundJobs;
using DoohSamikshya.Interface.Application.Dbo;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Interface.Shared;
using DoohSamikshya.Service.Application.BackgroundJobs;
using DoohSamikshya.Service.Application.Dbo;
using DoohSamikshya.Service.Application.Inv;
using DoohSamikshya.Service.Application.Media;
using DoohSamikshya.Service.Shared;



var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IDataAccessService, DataAccessService>()
                .AddScoped<IScreenService, ScreenService>()
                .AddScoped<IMediaLibraryService, MediaLibraryService>()
                .AddScoped<ICampaignService, CampaignService>()
                .AddScoped<ICampaignMediaService, CampaignMediaService>();
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();
builder.Services.AddHostedService<CampaignStatusHostedService>();


builder.Services.AddScoped<IMediaService>(provider =>
{
    var env = provider.GetRequiredService<IWebHostEnvironment>();
    return new MediaService(env.WebRootPath);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var uploadPath = Path.Combine(
    builder.Environment.WebRootPath ??
    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
    "uploads",
    "media"
);

Directory.CreateDirectory(uploadPath);

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();