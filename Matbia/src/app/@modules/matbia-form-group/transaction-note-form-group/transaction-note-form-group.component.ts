import { AfterContentInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SharedModule } from '@matbia/shared/shared.module';

@Component({
  selector: 'app-transaction-note-form-group',
  templateUrl: './transaction-note-form-group.component.html',
  styleUrls: ['./transaction-note-form-group.component.scss'],
  imports: [SharedModule],
})
export class TransactionNoteFormGroupComponent implements OnInit, AfterContentInit {
  @Input() formGroup!: FormGroup;

  @Input() noteMessage = true;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterContentInit(): void {
    this.changeDetectorRef.detectChanges();
  }
}
