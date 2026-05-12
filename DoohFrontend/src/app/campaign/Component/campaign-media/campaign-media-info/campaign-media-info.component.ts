import { Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { sharedImports } from '../../../../shared/sharedImports';
import { AppComponent } from '../../../../app.component';

@Component({
  selector: 'campaign-media-info',
  standalone: true,
  imports: [sharedImports],
  templateUrl: './campaign-media-info.component.html',
  styleUrl: './campaign-media-info.component.scss'
})
export class CampaignMediaInfoComponent extends AppComponent implements OnChanges {

  @Input() campaignId!: number;

  data: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(injector: Injector) {
          super(injector);
      }

  ngOnChanges(): void {

    console.log('CHILD COMPONENT LOADED');
  console.log('campaignId:', this.campaignId);

  if (!this.campaignId || this.campaignId <= 0) return;

  this.load();
}

// ngOnInit(): void {
//   if (this.campaignId > 0) {
//     this.load();
//   }
// }

load(): void {
  console.log('API CALL WITH:', this.campaignId);

  this.campaignMediaService
    .getCampaignMedia({ campaignId: this.campaignId })
    .subscribe({
      next: (res: any) => {
        console.log('FULL API RESPONSE:', res);

        const raw = res?.data?.data || [];

        // Normalize + ensure consistent PlayOrder field
        this.data = raw.map((x: any) => ({
          ...x,
          playOrder: x.playOrder ?? x.PlayOrder ?? null
        }));

        // Optional: sort by PlayOrder
        this.data.sort((a: any, b: any) => (a.playOrder ?? 0) - (b.playOrder ?? 0));

        console.log('FINAL ASSIGNED DATA:', this.data);
      },
      error: (err) => {
        console.error('API ERROR:', err);
      }
    });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}