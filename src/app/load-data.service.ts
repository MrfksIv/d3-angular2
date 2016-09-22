import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class LoadDataService {

	constructor() { }

	transformedData;
	initialData;

	private data = new Subject<any>();
	private modifiedData = new Subject<any>();

	data$ = this.data.asObservable();
	modifiedData$ = this.modifiedData.asObservable();

	loadData() {
		d3.csv("./csvs/01_Sales_Snapshot_pandora_2016_06.csv", (data) => { 
			this.data.next(data);
			this.prepareData(data);
			this.initialData = data;
		});
	}


	getData() {
		return this.data;
	}


	prepareData(dataReceived) {
  	
  		let tempArr = [];

    	var parseTime : any = d3.timeParse("%b %Y");

  		for (let i=0; i < dataReceived.length; i++){
  			let tempObj;
	  		
	  		for(let key in dataReceived[i]) {
	  		

	  			if (key.indexOf("M_") !== -1) {
	  				tempObj = {};
	  			
		  			tempObj["FACTS"] = dataReceived[i]["FACTS"];
		  			tempObj["list"] = dataReceived[i]["list"];
		  			tempObj["store"] = dataReceived[i]["store"];
		  			tempObj["val"] = dataReceived[i][key];
		  			tempObj["date"] = parseTime(this.monthsObj[key.substring(key.length-2, key.length)] + " " + key.substring(2,6));  
		  			tempObj["month"] = this.monthsObj[key.substring(key.length-2, key.length)] + " " + key.substring(2,6);
	          
		  			tempArr.push(tempObj);
	  			}
  	  		}
		}

		this.transformedData = tempArr;

		this.modifiedData.next(this.transformedData);

  	}


  	monthsObj = {
	    "01": "Jan", "02": "Feb", "03": "Mar",
	    "04": "Apr", "05": "May", "06": "Jun",
	    "07": "Jul", "08": "Aug", "09": "Sep",
	    "10": "Oct", "11": "Nov", "12": "Dec"
  	}

}
