using DoohSamikshya.DataAccess;
using DoohSamikshya.Interface.Application.Core;
using DoohSamikshya.Interface.Application.Inv;
using DoohSamikshya.Interface.Application.Media;
using DoohSamikshya.Service.Application.Core;
using DoohSamikshya.Service.Application.Inv;
using DoohSamikshya.Service.Application.Media;
using DoohSamikshya.Service.Shared;
using DoohSamikshya.Interface.Shared;
using DoohSamikshya.Service.Shared;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IDataAccessService, DataAccessService>()
                .AddScoped<IScreenService, ScreenService>()
                .AddScoped<ITenantService, TenantService>()
                .AddScoped<IMediaLibraryService, MediaLibraryService>();
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

var uploadPath = Path.Combine(builder.Environment.WebRootPath ??
                 Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "media");
Directory.CreateDirectory(uploadPath);

var app = builder.Build();

// Configure the HTTP request pipeline.
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

