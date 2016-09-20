import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

  constructor() { }

  	public colors = {

  		blue: ["#003F87", "#7EB6FF", "#5993E5", "#499DF5", "#C6E2FF", "#60AFFE", "#003F87", "#CAE1FF", "#2C5197", "#D9D9F3" ],
  		red: [],
  		orange: []
  	}

  	getRandom(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

}
