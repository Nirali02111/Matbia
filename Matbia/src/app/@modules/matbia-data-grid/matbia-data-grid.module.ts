import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatbiaDataGridService } from './matbia-data-grid.service';
import { SearchPipe } from '@matbia/matbia-pipes/search.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [MatbiaDataGridService, SearchPipe],
})
export class MatbiaDataGridModule {}
