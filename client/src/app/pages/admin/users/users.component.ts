import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { UserService } from '@/core/services/user.service';
import { User } from '@/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    FileUploadModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    ConfirmDialogModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  user: User = { name: '', email: '', role: 'user' };
  roles = [
    {label: 'Admin', value: 'admin'},
    {label: 'Manager', value: 'manager'},
    {label: 'User', value: 'user'}
  ];
  selectedUsers: User[] = [];
  submitted = false;
  userDialog = false;
  isLoading = true;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 });
        this.isLoading = false;
      }
    });
  }

  openNew(): void {
    this.user = { name: '', email: '', role: 'user' };
    this.submitted = false;
    this.userDialog = true;
  }

  deleteSelectedUsers(): void {
    // Show confirmation dialog for bulk delete
    if (this.selectedUsers && this.selectedUsers.length > 0) {
      const numSelected = this.selectedUsers.length;
      this.confirmationService.confirm({
        message: `Êtes-vous sûr de vouloir supprimer ${numSelected} utilisateur(s) ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.performBulkDelete();
        },
        reject: () => {
          // User cancelled the deletion
        }
      });
    }
  }

  private performBulkDelete(): void {
    // Process each selected user for deletion
    const deletePromises = this.selectedUsers.map(user => {
      if (user._id) {
        return this.userService.deleteUser(user._id).toPromise();
      }
      return Promise.resolve();
    });

    Promise.all(deletePromises).then(() => {
      this.loadUsers();
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: `${this.selectedUsers.length} users deleted`,
        life: 3000
      });
      this.selectedUsers = []; // Clear selection
    }).catch(error => {
      console.error('Error deleting users:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete some users',
        life: 3000
      });
    });
  }

  editUser(user: User): void {
    this.user = { ...user };
    this.userDialog = true;
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (user._id) {
          this.userService.deleteUser(user._id).subscribe({
            next: () => {
              this.loadUsers();
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
            },
            error: (error: any) => {
              console.error('Error deleting user:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
            }
          });
        }
      },
      reject: () => {
        // User cancelled the deletion
      }
    });
  }

  hideDialog(): void {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser(): void {
    this.submitted = true;

    if (this.user.name?.trim() && this.user.email?.trim()) {
      if (this.user._id) {
        // Update existing user
        this.userService.updateUser(this.user).subscribe({
          next: (response: User) => {
            this.loadUsers();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
            this.userDialog = false;
            this.user = { name: '', email: '', role: 'user' };
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000 });
          }
        });
      } else {
        // Create new user
        this.userService.createUser(this.user).subscribe({
          next: (response: User) => {
            this.loadUsers();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
            this.userDialog = false;
            this.user = { name: '', email: '', role: 'user' };
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user', life: 3000 });
          }
        });
      }
    }
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getSeverity(role: string): string {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'info';
    }
  }
}