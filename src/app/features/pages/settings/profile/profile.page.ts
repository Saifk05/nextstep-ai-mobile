import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast';


import {
  IonContent,
  IonIcon,
  NavController,
  // ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  cameraOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';

import {
  UserProfile,
  UpdateProfilePayload,
  AddressSuggestion,
  AddressSuggestionsResponse,
} from '../../../../core/models/profile.model';

type ProfileForm = UpdateProfilePayload & {
  address?: string;
};

type UpdateProfileRequest = UpdateProfilePayload & {
  address?: AddressSuggestion;
};

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class ProfilePage implements OnInit {
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  isUploadingPhoto = false;

  profile: UserProfile | null = null;

  addressSuggestions: AddressSuggestion[] = [];
  selectedAddress: AddressSuggestion | null = null;

  private addressSearchTimer: ReturnType<typeof setTimeout> | null = null;

  form: ProfileForm = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: null,
    gender: null,
    address: '',
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly navCtrl: NavController,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {
    addIcons({
      chevronBackOutline,
      cameraOutline,
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.apiService.getProfile().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.profile = response.data;
          this.setFormFromProfile();

          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: async (error: unknown) => {
        console.error('PROFILE ERROR', error);

        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });

        this.toastService.error('Failed to load profile');
      },
    });
  }

  toggleEdit(): void {
    if (this.isUploadingPhoto) {
      return;
    }

    this.isEditMode = !this.isEditMode;

    if (!this.isEditMode) {
      this.addressSuggestions = [];
      this.selectedAddress = null;
      this.setFormFromProfile();
    }

    this.cdr.detectChanges();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (!this.isEditMode || this.isUploadingPhoto) {
      return;
    }

    fileInput.click();
  }

  async onProfilePictureSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Only JPG, PNG, or WEBP images are allowed');
      input.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.toastService.error('Image size should be less than 5MB');
      input.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.isUploadingPhoto = true;

    this.apiService.updateProfilePicture(formData).subscribe({
      next: async (response) => {
        this.ngZone.run(() => {
          this.profile = response.data;
          this.setFormFromProfile();

          this.isUploadingPhoto = false;
          this.cdr.detectChanges();
        });

        input.value = '';
        this.toastService.success('Profile picture updated successfully');
      },
      error: async (error: unknown) => {
        console.error('PROFILE PICTURE UPLOAD ERROR', error);

        this.ngZone.run(() => {
          this.isUploadingPhoto = false;
          this.cdr.detectChanges();
        });

        input.value = '';
        this.toastService.error('Failed to upload profile picture');
      },
    });
  }

  onAddressSearch(): void {
    const query = this.form.address?.trim() || '';

    this.selectedAddress = null;

    if (query.length < 3) {
      this.addressSuggestions = [];
      return;
    }

    if (this.addressSearchTimer) {
      clearTimeout(this.addressSearchTimer);
    }

    this.addressSearchTimer = setTimeout(() => {
      this.apiService.getAddressSuggestions(query).subscribe({
        next: (response: AddressSuggestionsResponse) => {
          this.ngZone.run(() => {
            this.addressSuggestions = response.data || [];
            this.cdr.detectChanges();
          });
        },
        error: (error: unknown) => {
          console.error('ADDRESS SEARCH ERROR', error);

          this.ngZone.run(() => {
            this.addressSuggestions = [];
            this.cdr.detectChanges();
          });
        },
      });
    }, 400);
  }

  selectAddress(item: AddressSuggestion): void {
    this.selectedAddress = item;
    this.form.address = item.description;
    this.addressSuggestions = [];
    this.cdr.detectChanges();
  }

  saveProfile(): void {
  if (this.isSaving || this.isUploadingPhoto) {
    return;
  }

  if (this.form.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.form.dateOfBirth);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      this.toastService.error('You must be at least 18 years old.');
      return;
    }
  }

  this.isSaving = true;

  const payload: UpdateProfileRequest = {
    firstName: this.form.firstName?.trim() || '',
    lastName: this.form.lastName?.trim() || '',
    phoneNumber: this.form.phoneNumber?.trim() || '',
    dateOfBirth: this.form.dateOfBirth || null,
    gender: this.form.gender || null,
  };

  if (this.selectedAddress) {
    payload.address = this.selectedAddress;
  }

  this.apiService.updateProfile(payload).subscribe({
    next: (response) => {
      this.ngZone.run(() => {
        this.profile = response.data;
        this.setFormFromProfile();

        this.addressSuggestions = [];
        this.selectedAddress = null;
        this.isSaving = false;
        this.isEditMode = false;

        this.cdr.detectChanges();
      });

      this.toastService.success('Profile updated successfully');
    },
    error: (error: unknown) => {
      console.error('UPDATE PROFILE ERROR', error);

      this.ngZone.run(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      });

      this.toastService.error('Failed to update profile');
    },
  });
}

  goBack(): void {
    this.navCtrl.navigateBack('/settings');
  }

  private setFormFromProfile(): void {
    if (!this.profile) {
      return;
    }

    this.form = {
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      phoneNumber: this.profile.phoneNumber || '',
      dateOfBirth: this.profile.dateOfBirth
        ? String(this.profile.dateOfBirth).slice(0, 10)
        : null,
      gender: this.profile.gender || null,
      address:
        this.profile.address?.mainText ||
        this.profile.address?.description ||
        '',
    };
  }

  get fullName(): string {
    if (!this.profile) {
      return '';
    }

    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
  }

  get avatarLetter(): string {
    return this.profile?.firstName
      ? this.profile.firstName.charAt(0).toUpperCase()
      : 'U';
  }

  get addressText(): string {
    if (!this.profile?.address) {
      return 'Address not added';
    }

    return this.profile.address.description || 'Address not added';
  }

 onFirstNameInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cleanValue = input.value.replace(/[^a-zA-Z\s]/g, '');

  input.value = cleanValue;
  this.form.firstName = cleanValue;
}

onLastNameInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cleanValue = input.value.replace(/[^a-zA-Z\s]/g, '');

  input.value = cleanValue;
  this.form.lastName = cleanValue;
}

onPhoneNumberInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const cleanValue = input.value.replace(/\D/g, '').slice(0, 10);

  input.value = cleanValue;
  this.form.phoneNumber = cleanValue;
}
}