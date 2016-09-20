import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-newcomp',
  template: `
    <h1> {{ property }} </h1>
    <article>
    test
      
    </article>
    <input type=text [ngStyle]="{color:'green'}" value="{{inputTxt1}}">
    <input type=text [ngClass]="{redBorder:true}" [value]="inputTxt2" #F>
    <button (click)="onSend(F)">Change!</button>
    <button (click)="onClicked()">Emit Event!</button>
    <p> {{ val }} </p>

  `,
  styles: [`
    article {
      border: 1px solid black;
    }

    .redBorder {
      border: 1px solid red;
    }

  `]
})
export class NewcompComponent  {



  @Input() property = "asfasfa";

  @Output()
  clicked = new EventEmitter<string>();

  val = "";
  onClicked() {
    this.clicked.emit(this.val);

  }
  

  inputTxt1 = "input text property 1";
  inputTxt2 = "input text property 2";

  constructor() { }


  onSend(F) {
    this.val = F.value;
  }

  private log(hook: string) {
    console.log(hook);
  }

}
