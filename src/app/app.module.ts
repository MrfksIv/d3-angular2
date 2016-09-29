import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NewcompComponent } from './newcomp.component';
import { LoadDataService } from './load-data.service';
import { ChartComponent } from './chart.component';

import { ColorService } from './colorservice.service';
import { TooltipService } from './tooltip.service';
import { TableComponent } from './table.component';

import { SelectComponent } from "ng2-select";
import {SelectModule} from 'ng2-select';

@NgModule({
  declarations: [
    AppComponent,
    NewcompComponent,
    ChartComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SelectModule
    
  ],
  providers: [LoadDataService, ColorService, TooltipService],
  bootstrap: [AppComponent]
})
export class AppModule { }
