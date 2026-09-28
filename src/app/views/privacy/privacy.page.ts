import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { StaticPage } from 'src/app/service/interface/static-page-interface';
import { StaticPageService } from 'src/app/service/static-page.service';

@Component({
  standalone: false,
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
})
export class PrivacyPage implements OnInit {
  page?: StaticPage;
  loading = false;
  error = '';

  constructor(
    private navController: NavController,
    private staticPageService: StaticPageService
  ) {}

  ngOnInit(): void {
    this.loadPrivacy();
  }

  loadPrivacy(): void {
    this.loading = true;
    this.error = '';

    this.staticPageService
      .getStaticPage('privacy')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: page => this.page = page,
        error: error => {
          this.page = undefined;
          this.error = error?.message || 'Impossibile caricare la Privacy Policy.';
        }
      });
  }

  handleBackButton(): void {
    this.navController.back();
  }
}
