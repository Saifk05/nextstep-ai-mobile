import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cameraOutline,
  checkmarkCircleOutline,
  imageOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { ToastService } from '../../../../core/services/toast';
import { UpdateTaskRequest } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-complete',
  templateUrl: './task-complete.component.html',
  styleUrls: ['./task-complete.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class TaskCompleteComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  taskId = '';
  proofFile: File | null = null;
  proofPreview: string | null = null;
  completionNote = '';
  isSubmitting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly toastService: ToastService
  ) {
    addIcons({
      arrowBackOutline,
      cameraOutline,
      checkmarkCircleOutline,
      imageOutline,
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.taskId) {
      this.toastService.error('Task id not found.');
      this.router.navigate(['/tasks']);
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks', this.taskId]);
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please upload an image file.');
      return;
    }

    this.proofFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.proofPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  removeProof(): void {
    this.proofFile = null;
    this.proofPreview = null;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  submitCompletion(): void {
    if (this.isSubmitting) return;

    if (!this.proofFile) {
      this.toastService.error('Please upload proof photo.');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // same profile-picture API, but backend expects field name "file"
    formData.append('file', this.proofFile);

    this.apiService.updateProfilePicture(formData).subscribe({
      next: (uploadResponse: any) => {
        console.log('Image upload response:', uploadResponse);

        const uploadedImageUrl =
          uploadResponse?.data?.profilePicture ||
          uploadResponse?.data?.profilePictureUrl ||
          uploadResponse?.data?.profileImage ||
          uploadResponse?.data?.url ||
          uploadResponse?.profilePicture;

        if (!uploadedImageUrl) {
          this.isSubmitting = false;
          this.toastService.error('Image uploaded but URL not found.');
          return;
        }

        const payload: UpdateTaskRequest = {
          status: 'COMPLETED',
          completionNote: this.completionNote.trim() || undefined,
          completedAt: new Date().toISOString(),
          proofImage: uploadedImageUrl,
        };

        this.apiService.updateTask(this.taskId, payload).subscribe({
          next: (response) => {
            this.isSubmitting = false;

            this.toastService.success(
              response.message || 'Task completed successfully.'
            );

            this.router.navigate(['/tasks', this.taskId]);
          },
          error: (error) => {
            console.error('Task update error:', error);

            this.isSubmitting = false;

            this.toastService.error(
              error?.error?.message ||
                'Image uploaded but task completion failed.'
            );
          },
        });
      },
      error: (error) => {
        console.error('Image upload error:', error);

        this.isSubmitting = false;

        this.toastService.error(
          error?.error?.message || 'Unable to upload proof image.'
        );
      },
    });
  }
}