import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ApiRequestError, AppService } from 'src/app/service/app-service';
import { outfit } from 'src/app/service/interface/outfit-all-interface';
import { PublicUserProfile } from 'src/app/service/interface/user-interface';
import { UserService } from 'src/app/service/user.service';

@Component({
  standalone: false,
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  readonly fallbackImage = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  profile: PublicUserProfile | null = null;
  outfits: outfit[] = [];
  uid = '';
  isLoading = true;
  isFollowLoading = false;
  isFollowing = false;
  profileNotFound = false;
  loadError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private userService: UserService,
    private alertController: AlertController,
  ) {}

  async ngOnInit(): Promise<void> {
    const initialUid = this.route.snapshot.paramMap.get('uid')?.trim() ?? '';
    this.uid = initialUid;

    this.route.paramMap.subscribe((paramMap) => {
      const nextUid = paramMap.get('uid')?.trim() ?? '';
      if (nextUid !== this.uid) {
        void this.loadProfile(nextUid);
      }
    });

    await this.loadProfile(initialUid);
  }

  private async loadProfile(uid: string): Promise<void> {
    this.uid = uid;
    this.profile = null;
    this.outfits = [];
    this.isFollowing = false;
    this.isFollowLoading = false;
    this.profileNotFound = false;
    this.loadError = false;
    this.isLoading = true;

    if (!uid) {
      this.loadError = true;
      this.isLoading = false;
      return;
    }

    if (this.userService.gUserProfile()()?.uid === uid) {
      this.isLoading = false;
      await this.router.navigate(['/tabs/my-profile']);
      return;
    }

    try {
      const profile = await firstValueFrom(this.appService.getPublicUserProfile(uid));
      if (this.uid !== uid) return;
      this.profile = profile;
      if (!this.profile?.uid) {
        this.profileNotFound = true;
        return;
      }

      const [outfits, status] = await Promise.all([
        firstValueFrom(this.appService.getPublicUserOutfits(uid)),
        firstValueFrom(this.userService.getFollowStatus(uid)),
      ]);
      if (this.uid !== uid) return;
      this.outfits = outfits ?? [];
      this.isFollowing = status.following;
    } catch (error) {
      if (this.uid !== uid) return;
      if (error instanceof ApiRequestError && error.status === 404 && !this.profile) {
        this.profileNotFound = true;
      } else {
        this.loadError = true;
      }
    } finally {
      if (this.uid === uid) this.isLoading = false;
    }
  }

  async toggleFollow(): Promise<void> {
    if (this.isFollowLoading || !this.uid) return;

    const wasFollowing = this.isFollowing;
    this.isFollowLoading = true;
    try {
      if (wasFollowing) {
        await firstValueFrom(this.userService.unfollowUser(this.uid));
      } else {
        await firstValueFrom(this.userService.followUser(this.uid));
      }
      this.isFollowing = !wasFollowing;
    } catch {
      this.isFollowing = wasFollowing;
      const alert = await this.alertController.create({
        header: 'Operazione non completata',
        message: wasFollowing
          ? 'Non è stato possibile smettere di seguire questo utente. Riprova.'
          : 'Non è stato possibile seguire questo utente. Riprova.',
        buttons: ['Ok'],
      });
      await alert.present();
    } finally {
      this.isFollowLoading = false;
    }
  }

  async openOutfit(outfitItem: outfit): Promise<void> {
    const navigated = await this.router.navigate(['/tabs/detail-outfit', outfitItem.id]);
    if (!navigated || outfitItem.userId === this.userService.gUserProfile()()?.uid) return;
    await this.appService.recordOutfitVisit(String(outfitItem.id));
  }
}
