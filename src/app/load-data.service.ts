import { Injectable } from '@angular/core';
import * as d3 from 'd3';

@Injectable()
export class LoadDataService {

	constructor() { }

	private data;
	private filteredData;

	loadData() {
		d3.csv("./csvs/01_Sales_Snapshot_pandora_2016_06.csv", (data) => { 
			console.log(data);
			this.data = data; 
		});
	}


	getData() {
		return this.data;
	}

	getDataForPlot(fact) {
		return this.data.filter( function(elem) {
			return elem["FACTS"] === fact;
		} )
	}

}
