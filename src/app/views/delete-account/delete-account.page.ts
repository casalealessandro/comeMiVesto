import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  standalone: false,
  selector: 'app-delete-account',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
})
export class DeleteAccountPage implements OnInit {
  authenticated = false;
  deleting = false;
  deleted = false;

  constructor(
    private firebase: FirebaseService,
    private userService: UserService,
    private alertController: AlertController,
    private navController: NavController,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.firebase.waitForAuthState();
    this.authenticated = !!user;
  }

  handleBackButton(): void {
    this.navController.back();
  }

  async login(): Promise<void> {
    await this.router.navigate(['/login'], {
      queryParams: { returnUrl: '/delete-account' }
    });
  }

  async confirmDeletion(): Promise<void> {
    if (!this.authenticated || this.deleting) return;

    const alert = await this.alertController.create({
      header: 'Elimina account',
      message: 'Stai per eliminare definitivamente il tuo account Come Mi Vesto e i dati associati. Questa operazione non può essere annullata.',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina account',
          role: 'destructive',
          handler: () => {
            void this.deleteAccount();
          }
        }
      ]
    });

    await alert.present();
  }

  private async deleteAccount(): Promise<void> {
    this.deleting = true;

    try {
      const deleted = await this.userService.deleteAccount();
      if (!deleted) {
        await this.showError();
        return;
      }

      this.authenticated = false;
      this.deleted = true;
    } catch (error) {
      console.error('Errore durante la cancellazione dell\'account:', error);
      await this.showError();
    } finally {
      this.deleting = false;
    }
  }

  private async showError(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Attenzione!',
      message: 'Non è stato possibile eliminare l\'account. Riprova più tardi.',
      buttons: ['Ok']
    });
    await alert.present();
  }
}
