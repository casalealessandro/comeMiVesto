import { Component, DestroyRef, OnInit, effect, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { SharedDataService } from 'src/app/service/shared-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/service/user.service';
import { PreferencesOnboardingComponent } from 'src/app/components/preferences-onboarding/preferences-onboarding.component';
import { GuestOutfitNudge } from './guest-outfit-nudge';

@Component({
  standalone: false,
  selector: 'app-layout-tabs',
  templateUrl: './layout-tabs.page.html',
  styleUrls: ['./layout-tabs.page.scss'],
})
export class LayoutTabsPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  canGoBack:boolean=false
  showHeader:boolean=true
  tabLoading:boolean=false
  hideBottomBar:boolean=false
  private tabLoadingTimeout:any
  private preferencesOnboardingOpen = false;
  private readonly preferencesOnboardingSkippedKey = 'preferencesOnboardingSkipped';
  private readonly guestNudgeSessionKey = 'cmv-guest-outfit-nudge-shown';
  private readonly guestNudge = inject(GuestOutfitNudge);
  private guestNudgeTimer?: ReturnType<typeof setInterval>;
  private guestNudgeChecking = false;
  guestNudgeVisible = false;
  guestNudgeOutfitId: string | null = null;

  private readonly guestVisibilityChanged = (): void => {
    this.guestNudge.updateVisibility(Date.now(), !document.hidden);
    if (!document.hidden) void this.maybeShowGuestNudge();
  };

  constructor(
    private sharedData: SharedDataService,
    private navController: NavController,
    private router: Router,
    private modalController: ModalController,
    private userService: UserService,
  ) {
    // The guest profile can become available after the initial route event.
    // React to the profile signal instead of relying on NavigationEnd alone.
    effect(() => {
      if (this.isGuest) {
        this.startGuestNudgeTracking();
        this.guestNudge.recordRoute(this.router.url);
      } else {
        this.guestNudgeVisible = false;
        this.stopGuestNudgeTracking();
        this.guestNudge.reset();
      }
    });
  }

  ngOnInit() {
    this.hideBottomBar = this.router.url.includes('/tabs/add-outfit');

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(event => {
      if (!this.isGuest) {
        this.guestNudgeVisible = false;
        this.stopGuestNudgeTracking();
        return;
      }
      // Only count time spent exploring the guest feed/outfit details.
      if (!this.isGuestFeed(event.urlAfterRedirects) &&
          !/^\/tabs\/detail-outfit\//.test(event.urlAfterRedirects)) {
        this.guestNudgeVisible = false;
        this.stopGuestNudgeTracking();
        return;
      }
      this.startGuestNudgeTracking();
      this.guestNudge.recordRoute(event.urlAfterRedirects);
      if (!this.isGuestFeed(event.urlAfterRedirects)) {
        this.guestNudgeVisible = false;
      } else {
        void this.maybeShowGuestNudge();
      }
    });
    this.destroyRef.onDestroy(() => this.stopGuestNudgeTracking());

    this.sharedData.staredData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const layoutData = this.sharedData.getData('LayoutTabsComponent');
      if (!layoutData.length || typeof layoutData[0]?.data?.hideBottomBar !== 'boolean') {
        return;
      }
      this.hideBottomBar = layoutData[0].data.hideBottomBar;
    });
  }
  
  get isGuest(): boolean {
    return this.userService.gUserProfile()()?.isGuest === true;
  }

  async ionViewDidEnter(): Promise<void> {
    await this.openPreferencesOnboardingIfNeeded();
    this.startGuestNudgeTracking();
    if (this.isGuest) this.guestNudge.recordRoute(this.router.url);
  }

  private async openPreferencesOnboardingIfNeeded(): Promise<void> {
    if (this.preferencesOnboardingOpen || sessionStorage.getItem(this.preferencesOnboardingSkippedKey) === 'true') {
      return;
    }

    const userLoaded = await this.userService.loadUser();
    if (!userLoaded || this.isGuest || this.userService.gPreferencesConfigured()()) {
      return;
    }

    this.preferencesOnboardingOpen = true;
    try {
      const modal = await this.modalController.create({
        component: PreferencesOnboardingComponent,
        cssClass: 'cmv-preferences-onboarding',
        backdropDismiss: false,
      });
      await modal.present();

      const { role } = await modal.onDidDismiss();
      if (role === 'skip') {
        sessionStorage.setItem(this.preferencesOnboardingSkippedKey, 'true');
      } else if (role === 'complete') {
        sessionStorage.removeItem(this.preferencesOnboardingSkippedKey);
      }
    } finally {
      this.preferencesOnboardingOpen = false;
    }
  }

  private startGuestNudgeTracking(): void {
    if (!this.isGuest || !this.router.url.startsWith('/tabs/') ||
        this.guestNudgeTimer || sessionStorage.getItem(this.guestNudgeSessionKey)) return;
    this.guestNudge.updateVisibility(Date.now(), !document.hidden);
    document.addEventListener('visibilitychange', this.guestVisibilityChanged);
    this.guestNudgeTimer = setInterval(() => {
      if (!this.isGuest) {
        this.guestNudgeVisible = false;
        this.stopGuestNudgeTracking();
        return;
      }
      this.guestNudge.updateVisibility(Date.now(), !document.hidden);
      void this.maybeShowGuestNudge();
    }, 3000);
  }

  private stopGuestNudgeTracking(): void {
    if (this.guestNudgeTimer) {
      this.guestNudge.updateVisibility(Date.now(), false);
      clearInterval(this.guestNudgeTimer);
    }
    this.guestNudgeTimer = undefined;
    document.removeEventListener('visibilitychange', this.guestVisibilityChanged);
  }

  private isGuestFeed(url: string): boolean {
    return url.split(/[?#]/, 1)[0].replace(/\/$/, '') === '/tabs/myoutfit';
  }

  private async maybeShowGuestNudge(): Promise<void> {
    if (this.guestNudgeChecking || this.guestNudgeVisible || !this.isGuest || document.hidden ||
        sessionStorage.getItem(this.guestNudgeSessionKey) || this.tabLoading) return;
    if (!this.guestNudge.canPromptOnFeed(this.router.url)) return;
    const outfitId = this.guestNudge.outfitToSaveOnFeed(this.router.url);
    const focusedElement = document.activeElement;
    if (focusedElement?.closest('input, textarea, ion-input, ion-searchbar, [contenteditable="true"]')) return;

    this.guestNudgeChecking = true;
    try {
      // Do not interrupt filters, Terms, images or other Ionic overlays.
      if (await this.modalController.getTop()) return;
      if (!this.isGuest || document.hidden || !this.guestNudge.canPromptOnFeed(this.router.url) ||
          sessionStorage.getItem(this.guestNudgeSessionKey)) return;
      this.guestNudgeOutfitId = outfitId;
      this.guestNudgeVisible = true;
      sessionStorage.setItem(this.guestNudgeSessionKey, 'true');
      this.stopGuestNudgeTracking();
    } finally {
      this.guestNudgeChecking = false;
    }
  }

  dismissGuestNudge(): void {
    this.guestNudgeVisible = false;
  }

  saveGuestNudgeOutfit(): void {
    const outfitId = this.guestNudgeOutfitId;
    this.dismissGuestNudge();
    if (!this.isGuest) return;
    if (outfitId) {
      void this.router.navigate(['/guestQuickRegister'], { queryParams: { outfitId } });
      return;
    }
    // Browsing the feed is valuable even without opening an outfit detail.
    // Do not invent an outfit to save: guide the visitor to choose one.
    const firstCard = document.querySelector<HTMLElement>('app-myoutfit .outfit-card');
    firstCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const saveHeart = firstCard?.querySelector<HTMLElement>('[aria-label="Salva outfit nei preferiti"]');
    saveHeart?.focus({ preventScroll: true });
  }

  onTabWillChange() {
    if (this.tabLoadingTimeout) {
      clearTimeout(this.tabLoadingTimeout)
    }
    this.tabLoading = true
  }

  onTabChange(event: any) {
    this.tabLoadingTimeout = setTimeout(() => {
      this.tabLoading = false
    }, 250)
    const selectedTab = event.tab;
    this.hideBottomBar = selectedTab === 'add-outfit';
    console.log('Selected tab:', event);
    switch (selectedTab) {
      case 'myoutfit':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
           
            showLogo:true,
            showUserInfo:false,
           
          }
        });

        break;
        case 'add-outfit':
          this.sharedData.setData({
            componentName:'HeaderComponent',
            data: {
             
              showLogo:false,
              showUserInfo:false,
              showTitleText:true,
              titleText:'Crea outfit',
              showSubtitleText:true,
              subtitleText:'Combina i tuoi capi per creare un look completo.',
              canGoBack:true
             
            }
          });
  
          break;
     case 'my-profile':
      this.sharedData.setData({
        componentName:'HeaderComponent',
        data: {
          
          showLogo:false,
          showUserInfo:true,
          canGoBack:true
        }
      })
      break;
      case 'outfit-products':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
            
            showLogo:true,
            canGoBack:true
          }
        })
        break;
      case 'my-wardrobes':
        this.sharedData.setData({
          componentName:'HeaderComponent',
          data: {
            
           
          showLogo:false,
          showUserInfo:false,
          showTitleText:true,
          titleText:'Armadio personale',
          canGoBack:true
          }
        })
        break;
      default:
        break;
    }
    // Logica aggiuntiva basata sulla scheda selezionata
    if (selectedTab === 'settings') {
      console.log('Navigato a Settings');
    }
  }
  
  

}
