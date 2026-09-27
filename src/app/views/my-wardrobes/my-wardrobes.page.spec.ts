import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';

import { MyWardrobesPage } from './my-wardrobes.page';
import { AppService } from 'src/app/service/app-service';
import { FirebaseService } from 'src/app/service/firebase.service';
import { UserService } from 'src/app/service/user.service';

describe('MyWardrobesPage', () => {
  let component: MyWardrobesPage;
  let fixture: ComponentFixture<MyWardrobesPage>;

  const appServiceMock = {
    resultsSignal: signal<any[]>([]),
    getData: jasmine.createSpy('getData'),
    deleteWardrobe: jasmine.createSpy('deleteWardrobe'),
    createWardrobe: jasmine.createSpy('createWardrobe')
  };

  const firebaseServiceMock = {
    authState: of(null)
  };

  const userServiceMock = {
    getUserWardrobes: jasmine.createSpy('getUserWardrobes')
      .and.returnValue(of([]))
  };

  const modalControllerMock = jasmine.createSpyObj(
    'ModalController',
    ['getTop', 'create', 'dismiss']
  );

  const alertControllerMock = jasmine.createSpyObj(
    'AlertController',
    ['create']
  );

  beforeEach(waitForAsync(() => {
    appServiceMock.createWardrobe.calls.reset();
    appServiceMock.deleteWardrobe.calls.reset();
    modalControllerMock.create.calls.reset();
    alertControllerMock.create.calls.reset();
    alertControllerMock.create.and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ role: 'cancel' })
    } as any);
    modalControllerMock.getTop.calls.reset();
    modalControllerMock.dismiss.calls.reset();
    modalControllerMock.getTop.and.resolveTo(null);
    TestBed.configureTestingModule({
      declarations: [MyWardrobesPage],
      imports: [
        IonicModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: AppService,
          useValue: appServiceMock
        },
        {
          provide: FirebaseService,
          useValue: firebaseServiceMock
        },
        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: ModalController,
          useValue: modalControllerMock
        },
        {
          provide: AlertController,
          useValue: alertControllerMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyWardrobesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not delete a wardrobe item when removal is cancelled', async () => {
    await component.deleteItemWadro({ id: 'wardrobe-1', name: 'Giacca' });

    expect(alertControllerMock.create).toHaveBeenCalled();
    expect(appServiceMock.deleteWardrobe).not.toHaveBeenCalled();
  });

  it('deletes and refreshes the wardrobe after confirmation', async () => {
    alertControllerMock.create.and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ role: 'confirm' })
    } as any);
    appServiceMock.deleteWardrobe.and.resolveTo(true);
    spyOn(component, 'groupItemsByCategory').and.resolveTo();

    await component.deleteItemWadro({ id: 'wardrobe-1', name: 'Giacca' });

    expect(appServiceMock.deleteWardrobe).toHaveBeenCalledOnceWith('wardrobe-1');
    expect(component.groupItemsByCategory).toHaveBeenCalledTimes(1);
  });

  it('refreshes a completed store selection without saving it again', async () => {
    const createdWardrobeItem = { id: 'wardrobe-1' };
    const modal = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ data: createdWardrobeItem, role: 'selected' })
    };
    modalControllerMock.create.and.resolveTo(modal as any);
    spyOn(component, 'groupItemsByCategory').and.resolveTo();
    spyOn(component.selectedItem, 'emit');

    await component.searchClothModal();

    expect(appServiceMock.createWardrobe).not.toHaveBeenCalled();
    expect(component.groupItemsByCategory).toHaveBeenCalledTimes(1);
    expect(component.selectedItem.emit).toHaveBeenCalledOnceWith(createdWardrobeItem);
  });

  it('dismisses itself with the created item when opened as a modal', async () => {
    const createdWardrobeItem = { id: 'wardrobe-1' };
    const parentModal = { dismiss: jasmine.createSpy('dismiss').and.resolveTo(true) };
    const storeModal = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ data: createdWardrobeItem, role: 'selected' })
    };
    component.showheader = true;
    modalControllerMock.getTop.and.resolveTo(parentModal as any);
    modalControllerMock.create.and.resolveTo(storeModal as any);
    spyOn(component, 'groupItemsByCategory').and.resolveTo();
    spyOn(component.selectedItem, 'emit');

    await component.searchClothModal();

    expect(appServiceMock.createWardrobe).not.toHaveBeenCalled();
    expect(component.groupItemsByCategory).toHaveBeenCalledTimes(1);
    expect(parentModal.dismiss).toHaveBeenCalledOnceWith(createdWardrobeItem);
    expect(component.selectedItem.emit).not.toHaveBeenCalled();
  });

  it('keeps the normal page open after a completed store selection', async () => {
    const createdWardrobeItem = { id: 'wardrobe-1' };
    const storeModal = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ data: createdWardrobeItem, role: 'selected' })
    };
    component.showheader = false;
    modalControllerMock.create.and.resolveTo(storeModal as any);
    spyOn(component, 'groupItemsByCategory').and.resolveTo();
    spyOn(component.selectedItem, 'emit');

    await component.searchClothModal();

    expect(modalControllerMock.getTop).not.toHaveBeenCalled();
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
    expect(component.groupItemsByCategory).toHaveBeenCalledTimes(1);
    expect(component.selectedItem.emit).toHaveBeenCalledOnceWith(createdWardrobeItem);
  });

  it('does nothing when store selection is cancelled', async () => {
    const modal = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.resolveTo({ role: 'cancel' })
    };
    modalControllerMock.create.and.resolveTo(modal as any);
    spyOn(component, 'groupItemsByCategory').and.resolveTo();

    await component.searchClothModal();

    expect(appServiceMock.createWardrobe).not.toHaveBeenCalled();
    expect(component.groupItemsByCategory).not.toHaveBeenCalled();
  });

  it('creates only one search modal for concurrent invocations', async () => {
    let dismiss!: (value: any) => void;
    const modal = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(new Promise(resolve => dismiss = resolve))
    };
    modalControllerMock.create.and.resolveTo(modal as any);

    const first = component.searchClothModal();
    const duplicate = component.searchClothModal();
    await Promise.resolve();
    expect(modalControllerMock.create).toHaveBeenCalledTimes(1);
    dismiss({ role: 'cancel' });
    await Promise.all([first, duplicate]);

    await component.searchClothModal();
    expect(modalControllerMock.create).toHaveBeenCalledTimes(2);
  });
});
