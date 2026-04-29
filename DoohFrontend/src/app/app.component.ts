import { Component, Injector } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MediaLibraryService } from './media/service/MediaLibraryService';
import { ScreenService } from './screens/Service/ScreenService';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';           // ← add
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // ← add

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastModule,         
    ConfirmDialogModule, 
  ],
  // providers: [
  //   MessageService,    
  //   ConfirmationService,  
  // ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly mediaLibraryService: MediaLibraryService;
  protected readonly screenService: ScreenService;
  protected readonly messageService: MessageService;
  protected readonly confirmationService: ConfirmationService;

  constructor(protected readonly injector: Injector) {
    this.mediaLibraryService  = injector.get(MediaLibraryService);
    this.screenService        = injector.get(ScreenService);
    this.messageService       = injector.get(MessageService);
    this.confirmationService  = injector.get(ConfirmationService);
  }

  protected showMessage(
    summary: string,
    detail: string,
    severity: 'success' | 'info' | 'warn' | 'error' = 'info'
  ): void {
    this.messageService.add({ severity, summary, detail });
  }

  protected confirmAction(config: {
    message: string;
    header?: string;
    accept: () => void;
    reject?: () => void;
  }): void {
    this.confirmationService.confirm(config);
  }
}