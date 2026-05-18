using DoohSamikshya.Interface.Application.Dbo;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DoohSamikshya.Service.Application.BackgroundJobs;

public class CampaignStatusHostedService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<CampaignStatusHostedService> _logger;

    public CampaignStatusHostedService(
        IServiceProvider services,
        ILogger<CampaignStatusHostedService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Campaign Status Hosted Service started.");

        await DoWork(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await DoWork(stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Campaign Status Hosted Service stopping.");
        }
    }

    private async Task DoWork(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _services.CreateScope();
            var campaignService = scope.ServiceProvider
                .GetRequiredService<ICampaignService>();

            await campaignService.CheckAndUpdateAllCampaignStatusesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in Campaign Status background job.");
        }
    }
}