import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './components/shared/toast/toast-container.component';
import { SystemSettingsService } from './services/system-settings.service';
import { MaintenanceComponent } from './components/home/maintenance/maintenance.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, MaintenanceComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private settingsService = inject(SystemSettingsService);
  isMaintenance = this.settingsService.isMaintenance;

  ngOnInit() {
    this.settingsService.loadSystemSettings();
  }
}
