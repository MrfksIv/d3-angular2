import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoadDataService } from './load-data.service';
import { Subscription } from 'rxjs/Subscription';
import { SelectComponent} from "ng2-select";

import * as d3 from 'd3';
declare var $:JQueryStatic;

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, AfterViewInit {

	transformedData;
	nestedData;
	unmappedData;

	custTypes : Array<string> = [];
	selectedCustTypes : Array<string> = [];

	shops : Array<string> = [];
	selectedShops : Array<string> = [];

	facts : Array<string> = [];
	selectedFacts : <string> = [];

	dataReady : boolean = false;

	factFilter : boolean = false;
	shopFilter : boolean = false;
	custTypeFilter : boolean false;

	table;

	subscriptionTransformedData: Subscription; 

	@ViewChild('tableArea') tableElement : HTMLElement;


	constructor(private lds : LoadDataService,
				private elementRef : ElementRef) { }

	ngOnInit() {
		this.subscriptionTransformedData = this.lds.data$.subscribe(
			data => {
				this.transformedData = data;
				this.nestedData = d3.nest()
					.key(function(d) { return d.store; })
					.key(function(d) { return d.FACTS; })
					.key(function(d) { return d.list; })
					.map(data);

				this.getFilterOptions();
				this.prepareData();

			}
		);
	}

	ngAfterViewInit() {
		setTimeout( () => {this.prepareTable()},0);
	}


	getFilterOptions() {
		this.getCustomerTypes();
		this.getShopNames();
		this.getFacts();
		this.dataReady = true;
	}

	getCustomerTypes() {
		let nest = d3.nest().key(function(d){ return d.list}).entries(this.transformedData);
		nest.forEach( elem => this.custTypes.push(name:elem.key));
	}

	getShopNames() {
		let nest = d3.nest().key(function(d){ return d.store}).entries(this.transformedData);
		nest.forEach( elem => this.shops.push(elem.key));
	}

	getFacts() {
		let nest = d3.nest().key(function(d){ return d.FACTS}).entries(this.transformedData);
		nest.forEach( elem => this.facts.push(elem.key));
	}


	public itemsToString(value:Array<any> = []):string {
		return value.join(',');
	}


	factFilterToggle(){
		this.factFilter = !this.factFilter;
		this.prepareData();
	}

	shopFilterToggle(){
		this.shopFilter = !this.shopFilter;
		this.prepareData();
	}

	custFilterToggle(){
		this.custTypeFilter = !this.custTypeFilter;
		this.prepareData();
	}



	factRemoved(evt) {
		this.selectedFacts.splice(this.selectedFacts.indexOf(evt.text),1);
		this.prepareData();
	}

	factAdded(evt) {
		this.selectedFacts.push(evt.text);
		this.prepareData();
	}

	shopRemoved(evt) {
		this.selectedShops.splice(this.selectedShops.indexOf(evt.text),1);
		
		this.prepareData();
	}

	shopAdded(evt) {
		this.selectedShops.push(evt.text);
		this.prepareData();

	}

	custTypeRemoved(evt) {
		this.selectedCustTypes.splice(this.selectedCustTypes.indexOf(evt.text),1);
		this.prepareData();
		
	}

	custTypeAdded(evt) {
		this.selectedCustTypes.push(evt.text);
		this.prepareData();

	}


	prepareData() {
		
		var dat;

		if(this.shopFilter && this.selectedShops.length > 0) {
			dat = this.selectedShops.map( (elem) => {
				return {shopName: elem, facts:this.nestedData.get(elem).entries()};
			});
		} else {
			dat = this.shops.map( (elem) => {
				return {shopName: elem, facts:this.nestedData.get(elem).entries()};
			});
		}
		
		
		if(this.factFilter && this.selectedFacts.length > 0) {
			dat.map( (elem) => {
				elem.facts.filter( (innerElem) => {
					
					if( this.selectedFacts.indexOf(innerElem.key) !== -1 ) {
						innerElem.keep = true;
					} else {
						innerElem.keep = false;
					}
				})
			})

			dat.forEach( (elem) => {
				elem.facts = elem.facts.filter( (innerElem) => {
					return innerElem.keep;
				}
			})
		}
		

		if(this.custTypeFilter && this.selectedCustTypes.length > 0) {
			dat.forEach ( (elem) => {

				elem.facts.forEach( (innerElem) => {

					for( var i = 0; i < this.custTypes.length i++) {
						
						if(this.selectedCustTypes.indexOf(this.custTypes[i]) === -1) {
							innerElem.value.remove(this.custTypes[i]);
						} 
					}
				})
			})
		}

		for(let i=0; i < dat.length; i++) {
			let innerArray = dat[i].facts;
			for (let j=0; j < innerArray.length; j++) {
				let obj = innerArray[j];
				
				innerArray[j] = {factName: obj.key, values: obj.value}
				
				let keys = innerArray[j].values.keys());
				
				innerArray[j].custTypes = [];
				for( let k=0; k < keys.length; k++) {
					innerArray[j].custTypes.push({custTypeName:keys[k], values: innerArray[j].values.get(keys[k]) });
				}
			}
		}

		this.unmappedData = dat;
	}


	prepareTable() {
		this.table = d3.select(this.elementRef.nativeElement)
			.select("table");
		var thead = this.table.append("thead")
			.attr("class","thead-default");
		var tbody = this.table.append("tbody");

		let headers = this.getColumnNames();
		
		this.insertMonthsHeader(headers);

	}

	getColumnNames() {
		let tmp = [];

		let months = {
						"01": "Jan'", "02": "Feb'","03": "Mar'",
						"04": "Apr'", "05": "May'","06": "Jun'",
						"07": "Jul'", "08": "Aug'","09": "Sep'",
						"10": "Oct'", "11": "Nov'","12": "Dec'"

					 };


		for (let key in this.unmappedData[0].facts[0].custTypes[0].values[0]){


			if (key.substring(0,2).toUpperCase() === "M_")
			tmp.push(months[key.substring(key.length-2, key.length)]+" "+ key.slice(4,6););
		}

		return tmp;
	}

	insertMonthsHeader(headArray) {
		d3.select("table thead")
			.append("tr")
			.selectAll("th")
			.data(headArray)
			.enter()
			.append("th")
			.text(function(d) {return d;});
	}


	drawTable() {

		

		var table : any = d3.select(this.elementRef.nativeElement)
			.select("table");

		var thead = table.append("thead");
		/*
		if(!this.shopNameCol){
			let shopNameCol= table.append("thead").selectAll("tr")
				.data(this.unmappedData, function(d) { return d.shopName});
		}
		*/

		var headerrows = table.selectAll("thead tr")
			.data(this.unmappedData, function(d) { return d.shopName});

		headerrows.enter()
			.append("tr")
			.selectAll("th")
			.data(function(d) { return d.shopName;})
			.enter()
			.append("th")
			.text(function(d) { return d});

		headerrows.exit().remove();
	}

	
}
