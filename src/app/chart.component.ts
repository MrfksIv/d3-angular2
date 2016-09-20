import { Component, OnInit, ViewChild, ElementRef, DoCheck } from '@angular/core';
import { LoadDataService } from './load-data.service';
import { ColorService } from './colorservice.service';  
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styles: []
})
export class ChartComponent implements OnInit, DoCheck {

  

  chartData;
  transformedData;
  nestedData;

  optionsEnabled : boolean = false;

  facts = [];
  shops = []
  custTypes = [];

  selectedShop;
  selectedFact;
  selectedCustType;


  @ViewChild('chartArea') svgElement: HTMLElement;

  constructor(private lds : LoadDataService, private colors: ColorService, private elementRef : ElementRef) { }

  ngOnInit() {
  	this.lds.loadData();
    
      	
 }

 ngDoCheck(){
   console.log("check done!");
   if( this.selectedFact)
     this.createLineChart();

 }

  test() {
  	this.chartData = this.lds.getData();
  	let tempArr = [];

    var parseTime : any = d3.timeParse("%b %Y");

  	for (let i=0; i < this.chartData.length; i++){
  		let tempObj;
	  	for(let key in this.chartData[i]) {
	  		

	  		if (key.indexOf("M_") !== -1) {
	  			tempObj = {};
	  			
	  			tempObj["FACTS"] = this.chartData[i]["FACTS"];
	  			tempObj["list"] = this.chartData[i]["list"];
	  			tempObj["store"] = this.chartData[i]["store"];
	  			tempObj["val"] = this.chartData[i][key];
	  			tempObj["date"] = parseTime(this.monthsObj[key.substring(key.length-2, key.length)] + " " + key.substring(2,6));  
	  			tempObj["month"] = this.monthsObj[key.substring(key.length-2, key.length)] + " " + key.substring(2,6);
          
	  			tempArr.push(tempObj);
	  		}
  	  }
	}

	this.transformedData = tempArr;
	
  /*
  	this.nestedData = d3.nest();
    this.nestedData = this.nestedData.key(function(d){ return d.FACTS});
    this.nestedData = this.nestedData.key(function(d){ return d.store});
    this.nestedData = this.nestedData.key(function(d){ return d.list});
  
  	this.nestedData = this.nestedData.entries(this.transformedData);
  */
  
    this.getFactsArray();

    this.getCustomerTypes();
    this.setCustTypeSelected(this.custTypes[0]);

    this.getShopNames();
    this.setShopSelected(this.shops[0]);

    this.optionsEnabled = true;

  }

  getCustomerTypes() {
    let nest = d3.nest().key(function(d){ return d.list}).entries(this.transformedData);
    nest.forEach( elem => this.custTypes.push(elem.key));
  }

  getShopNames() {
    let nest = d3.nest().key(function(d){ return d.store}).entries(this.transformedData);
    nest.forEach( elem => this.shops.push(elem.key));
  }

  getFacts(fact : string) {
    let nest = d3.nest().key(function(d){ return d.FACTS}).entries(this.transformedData);
    nest.forEach( elem => this.facts.push(elem.key));
  }

  setFactSelected(fact: string) {
    this.selectedFact = fact;
  }

  setShopSelected(shop: string) {
    this.selectedShop = shop;
  }

  setCustTypeSelected(custType : string) {
    this.selectedCustType = custType;
  }

  getDatafromTransformed(fact: string, custType: string) {
    return this.transformedData.filter( elem => elem["FACTS"] === fact)
                .filter( elem => elem["list"] === custType);
            //    .filter( elem => elem["store"] === this.selectedShop);
  }

  getFactsArray() {
    this.nestedData.forEach( elem => this.facts.push(elem.key));
  }


  createLineChart() {

    
    let dataTr = this.getDatafromTransformed(this.selectedFact, this.selectedCustType);

    console.log("creating chart...");
    console.log(dataTr);

    var nested = d3.nest()
    .key(function(d) { return d.store; })
    .map(dataTr);

    console.log(nested);

    console.log(nested.get(this.selectedShop));

  	let margin = {top: 30, right: 20, bottom: 30, left: 50},
   		width = 600 - margin.left - margin.right,
    	height = 270 - margin.top - margin.bottom;

    var parseTime : any = d3.timeParse("%b %Y");



    let x = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(dataTr, function(d){return d.date }));

 
  	let y = d3.scaleLinear()
        .range([height, 0])
           .domain([0, d3.max(dataTr, function(d){return d.val })]);

    console.log([0, d3.max(dataTr, function(d){return d.val })]);
  
	  let xAxis = d3.axisBottom(x);
  

  	let yAxis = d3.axisLeft(y);

	// Define the line
	
    var priceline : any = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.val); });

    var svg : any = d3.select(this.elementRef.nativeElement)
      .select("svg")
    	  .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
      .append("g")
        .attr("transform", 
               "translate("+ margin.left + "," + margin.top + ")");




/*

      
    this.nestedData.forEach(function(d) {
    	svg.append("path")
    		.attr("class", "line")
    		.attr("d", priceline(d.values))
    });

	*/

  }



  monthsObj = {
  	"01": "Jan", "02": "Jan", "03": "Jan",
  	"04": "Jan", "05": "Jan", "06": "Jan",
  	"07": "Jan", "08": "Jan", "09": "Jan",
  	"10": "Jan", "11": "Jan", "12": "Jan"
  }


}
