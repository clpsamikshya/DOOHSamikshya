import {
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { sharedImports } from '../../../shared/sharedImports';
import { AppComponent } from '../../../app.component';
import { Campaign, CampaignFilter } from '../../Model/Campaign';
import { ActivatedRoute } from '@angular/router';
import { CampaignStatus  } from '../../Model/CampaignEnum';
import { AddCampaignComponent } from '../add-campaign/add-campaign.component';
import { CampaignInfoComponent } from '../campaign-info/campaign-info.component';


@Component({
    selector: 'campaign-list',
    standalone: true,
    imports: [...sharedImports, AddCampaignComponent, CampaignInfoComponent],
    templateUrl: './campaign-list.component.html',
    styleUrl: './campaign-list.component.scss'
})
export class CampaignListComponent extends AppComponent implements OnInit, OnDestroy {
    @ViewChild('addedit') addedit!: AddCampaignComponent;
     @ViewChild('campaignInfo') campaignInfo!: CampaignInfoComponent;

    private readonly destroy$ = new Subject<void>();
    CampaignStatus = CampaignStatus;
    isLoading = false;

    campaigns: Campaign[] = [];

    totalRecords = 0;
    pageSize = 10;

    filter: CampaignFilter = {
        search: '',
        status: null,
        campaignId: null,
        offset: 0,
        pageSize: 10
    };

   constructor(injector: Injector, private route: ActivatedRoute) {
    super(injector);
  }

  statusOptions = [
    { label: 'New', value: CampaignStatus.New },
    { label: 'Active', value: CampaignStatus.Active },
    { label: 'Completed', value: CampaignStatus.Completed },
    { label: 'Paused', value: CampaignStatus.Paused },
    { label: 'Cancelled', value: CampaignStatus.Cancelled }
];

    ngOnInit(): void {
        this.loadCampaigns();
    }

    applyFilter(): void {

        this.filter = {
            ...this.filter,
            offset: 0
        };

        this.loadCampaigns();
    }

    clearFilter(): void {

        this.filter = {
            search: '',
            status: null,
            campaignId: null,
            offset: 0,
            pageSize: this.pageSize
        };

        this.loadCampaigns();
    }

    onSaveCampaign(): void {
    this.loadCampaigns();
}

    onPageChange(event: any): void {

        this.filter = {
            ...this.filter,
            offset: event.first,
            pageSize: event.rows
        };

        this.loadCampaigns();
    }

 openAddCampaign(): void {
    this.addedit?.onShow();
}

openCampaignInfo(campaign: Campaign): void {
    this.campaignInfo?.show(campaign);
}

    loadCampaigns(): void {

        this.isLoading = true;

        this.campaignService
            .getCampaigns(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({

                next: (res) => {
                    this.campaigns =
                        res.data?.data ?? [];

                    this.totalRecords =
                        res.data?.totalRows ?? 0;

                    this.isLoading = false;
                },

                error: (err: Error) => {

                    this.isLoading = false;

                    this.showMessage(
                        'Error',
                        err.message,
                        'error'
                    );
                }
            });
    }

    deleteCampaign(campaign: Campaign): void {
    this.confirmationService.close(); 

    this.confirmAction({
        message: `Are you sure you want to delete campaign ${campaign.name}?`,
        header: 'Confirm Deletion',

        accept: () => {
            this.campaignService.deleteCampaign(campaign.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showMessage('Success', 'Campaign deleted successfully', 'success');
                        this.loadCampaigns();
                    },
                    error: (err: Error) => {
                        this.showMessage('Error', err.message, 'error');
                    }
                });
        },

        reject: () => {
            this.showMessage('Info', 'Campaign deletion cancelled', 'info');
        }
    });
}

onCanclel(): void {
    this.addedit?.onCancel();
    
}

    ngOnDestroy(): void {

        this.destroy$.next();
        this.destroy$.complete();
    }
}