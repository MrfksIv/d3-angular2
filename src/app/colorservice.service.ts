import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

  constructor() { }

  	public colors = {

  		blues: ["#C1F0F6", "#05E9FF", "#50A6C2", "#00688B", "#104E8B", "#1874CD", "#003EFF", "#CAE1FF", "#2F2F4F", "#AAAAFF", "#191970" ],
  		red: [],
  		orange: []
  	}

  	getRandom(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

}
