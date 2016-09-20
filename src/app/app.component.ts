import { Component, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Root component';
  value = "";

  @ViewChild('labelValue') labelValueElement : HTMLElement;


  onClicked(value: string) {
  	this.value = value;
  }

  ngAfterViewInit() {
  	console.log(this.labelValueElement);
  }
}


