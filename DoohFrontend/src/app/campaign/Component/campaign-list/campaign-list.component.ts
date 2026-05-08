// campaign-list.component.ts

import {
    Component,
    Injector,
    OnDestroy,
    OnInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { sharedImports } from '../../../shared/sharedImports';
import { AppComponent } from '../../../app.component';
import { Campaign, CampaignFilter } from '../../Model/Campaign';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'campaign-list',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './campaign-list.component.html',
    styleUrl: './campaign-list.component.scss'
})
export class CampaignListComponent extends AppComponent implements OnInit, OnDestroy {


    private readonly destroy$ = new Subject<void>();

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
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 }
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

    onPageChange(event: any): void {

        this.filter = {
            ...this.filter,
            offset: event.first,
            pageSize: event.rows
        };

        this.loadCampaigns();
    }

    loadCampaigns(): void {

        this.isLoading = true;

        this.campaignService
            .getCampaigns(this.filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({

                next: (res) => {

                    console.log('Campaign Response:', res);

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

        this.confirmAction({

            message:
                `Are you sure you want to delete campaign ${campaign.name}?`,

            header: 'Confirm Deletion',

            accept: () => {

                this.campaignService
                    .deleteCampaign(campaign.id)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({

                        next: () => {

                            this.showMessage(
                                'Success',
                                'Campaign deleted successfully',
                                'success'
                            );

                            this.loadCampaigns();
                        },

                        error: (err: Error) => {

                            this.showMessage(
                                'Error',
                                err.message,
                                'error'
                            );
                        }
                    });
            },

            reject: () => {

                this.showMessage(
                    'Info',
                    'Campaign deletion cancelled',
                    'info'
                );
            }
        });
    }

    ngOnDestroy(): void {

        this.destroy$.next();
        this.destroy$.complete();
    }
}