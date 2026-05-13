import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AppComponent } from '../../../app.component';
import { sharedImports } from '../../../shared/sharedImports';

import { Campaign, CampaignFilter } from '../../Model/Campaign';
import { CampaignStatus } from '../../Model/CampaignEnum';

import { AddCampaignComponent } from '../add-campaign/add-campaign.component';
import { CampaignInfoComponent } from '../campaign-info/campaign-info.component';
import { AddEditCampaignMediaComponent } from '../campaign-media/add-edit-campaign-media/add-edit-campaign-media.component';

@Component({
    selector: 'campaign-list',
    standalone: true,
    imports: [
        ...sharedImports,
        AddCampaignComponent,
        CampaignInfoComponent,
        AddEditCampaignMediaComponent,
    ],
    templateUrl: './campaign-list.component.html',
    styleUrl: './campaign-list.component.scss',
})
export class CampaignListComponent extends AppComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    campaigns: Campaign[] = [];
    isLoading = false;
    pageSize = 10;
    totalRecords = 0;

    CampaignStatus = CampaignStatus;

    statusOptions = [
        { label: 'New', value: CampaignStatus.New },
        { label: 'Active', value: CampaignStatus.Active },
        { label: 'Completed', value: CampaignStatus.Completed },
        { label: 'Paused', value: CampaignStatus.Paused },
        { label: 'Cancelled', value: CampaignStatus.Cancelled },
    ];

    filter: CampaignFilter = {
        search: '',
        status: null,
        campaignId: null,
        offset: 0,
        pageSize: 10,
    };

    @ViewChild('addedit') addedit!: AddCampaignComponent;
    @ViewChild('campaignInfo') campaignInfo!: CampaignInfoComponent;
    @ViewChild('campaignMedia') campaignMedia!: AddEditCampaignMediaComponent;

    constructor(
        injector: Injector,
        private route: ActivatedRoute
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                this.filter.search = params['q'] ?? '';
                this.loadCampaigns();
            });
    }

    /* ================= LOAD ================= */
    loadCampaigns(): void {
        this.isLoading = true;

        this.campaignService.getCampaigns(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.campaigns = res?.data?.data ?? [];
                    this.totalRecords = res?.data?.totalRows ?? 0;
                    this.isLoading = false;
                },
                error: (err) => {
                    this.isLoading = false;
                    this.showMessage('Error', err.message, 'error');
                },
            });
    }

    /* ================= FILTER ================= */
    applyFilter(): void {
        this.loadCampaigns();
    }

    clearFilter(): void {
        this.filter = {
            search: '',
            status: null,
            campaignId: null,
            offset: 0,
            pageSize: this.pageSize,
        };
        this.loadCampaigns();
    }

    /* ================= PAGINATION ================= */
    onPageChange(event: any): void {
        this.filter.offset = event.first;
        this.filter.pageSize = event.rows;
        this.loadCampaigns();
    }

    /* ================= ACTIONS ================= */
    openAddCampaign(): void {
        this.addedit?.onShow();
    }

    openCampaignInfo(campaign: Campaign): void {
        this.campaignInfo?.show(campaign);
    }

    openCampaignMedia(campaign: Campaign): void {
        this.campaignMedia?.onShow(campaign.id);
    }

    onSaveCampaign(): void {
        this.loadCampaigns();
    }

    /* ================= DELETE ================= */
    deleteCampaign(campaign: Campaign): void {
        this.confirmAction({
            message: `Are you sure you want to delete ${campaign.name}?`,
            header: 'Delete Confirmation',

            accept: () => {
                this.campaignService.deleteCampaign(campaign.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: () => {
                            this.showMessage('Success', 'Deleted successfully', 'success');
                            this.loadCampaigns();
                        },
                        error: (err) => {
                            this.showMessage('Error', err.message, 'error');
                        },
                    });
            },

            reject: () => {
                this.showMessage('Info', 'Cancelled', 'info');
            },
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}