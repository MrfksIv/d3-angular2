import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { NewcompComponent } from './newcomp.component';
import { LoadDataService } from './load-data.service';
import { ChartComponent } from './chart.component';

import { ColorService } from './colorservice.service';

@NgModule({
  declarations: [
    AppComponent,
    NewcompComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [LoadDataService, ColorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
