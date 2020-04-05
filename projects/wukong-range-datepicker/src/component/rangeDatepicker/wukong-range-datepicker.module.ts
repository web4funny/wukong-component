/**
 * Created by musix on 2020/4/2.
 */
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MyDatePickerModule } from '../datepicker/my-date-picker.module';
// import { NzSelectModule } from '../select/nz-select.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { WukongRangeDatepickerComponent } from './wukong-range-datepicker.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MyDatePickerModule,
    // NzSelectModule,
    OverlayModule
  ],
  providers: [],
  declarations: [
    WukongRangeDatepickerComponent
  ],
  exports: [
    WukongRangeDatepickerComponent
  ]
})

export class WukongDatepickerModule { }

