import { Component, Input } from '@angular/core';
import { sharedImports } from '../../../shared/sharedImports';
import { ScreenOperatingHour, Screens } from '../../model/Screen';

@Component({
    selector: 'screen-operating-hour',
    standalone: true,
    imports: [sharedImports],
    templateUrl: './screen-operating-hour.component.html',
    styleUrl: './screen-operating-hour.component.scss',
})
export class ScreenOperatingHourComponent {

    visible: boolean = false;
    selectedScreenName: string = '';
    selectedOperatingHours: ScreenOperatingHour[] = [];

    readonly DAY_LABELS: Record<number, string> = {
        1: 'Sunday',
        2: 'Monday',
        3: 'Tuesday',
        4: 'Wednesday',
        5: 'Thursday',
        6: 'Friday',
        7: 'Saturday',
    };

    onShow(screen: Screens): void {
        this.selectedScreenName = screen.name;
        this.selectedOperatingHours = [...(screen.operatingHour ?? [])].sort(
            (a, b) => a.dayOfWeek - b.dayOfWeek
        );
        this.visible = true;
    }

    onHide(): void {
        this.visible = false;
    }

    getDayLabel(dayOfWeek: number): string {
        return this.DAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`;
    }

    formatTime(time: string): string {
        if (!time) return '—';
        const [h, m] = time.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${String(m).padStart(2, '0')} ${period}`;
    }
}