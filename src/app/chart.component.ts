import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoadDataService } from './load-data.service';
import { ColorService } from './colorservice.service';  
import { TooltipService } from './tooltip.service';  
import { Subscription } from 'rxjs/Subscription';
import { SelectComponent} from "ng2-select";


import * as d3 from 'd3';

//import * as $ from 'jquery';

declare var $:JQueryStatic;



@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit {
  

  chartData;
  transformedData;
  nestedData;

  options;

  optionsEnabled : boolean = false;

  facts = [];
  shops = []
  custTypes = [];
  includeNational : boolean = true;

  selectedShop;
  selectedFact ;
  selectedCustType;

  subscriptionInitialData: Subscription; 
  subscriptionTransformedData: Subscription; 

  dataReady : boolean = false;
  chartReady: boolean = false;

  @ViewChild('chartArea') svgElement: HTMLElement;

  constructor(private lds : LoadDataService, 
              private colourService: ColorService, 
              private elementRef : ElementRef,
              private tooltip : TooltipService) { }

  ngOnInit() {
    this.subscriptionInitialData = this.lds.data$.subscribe(
      data => {
        this.chartData = data;

      }
    );
    this.lds.loadData();  

    this.subscriptionTransformedData = this.lds.modifiedData$.subscribe(
      data => {
        this.transformedData = data;
        this.getFilterOptions();
        this.change();
      }
    )
 }

  ngAfterViewInit() {

    this.tooltip.createTooltip();
    this.createSvg();
    

  }

  getFilterOptions() {

    this.getFacts();
    this.getCustomerTypes();
    
    this.getShopNames();
    this.dataReady = true;

  }

  getCustomerTypes() {
    let nest = d3.nest().key(function(d){ return d.list}).entries(this.transformedData);
    nest.forEach( elem => this.custTypes.push(elem.key));
    this.selectedCustType = this.custTypes[0];
  }

  getShopNames() {
    let nest = d3.nest().key(function(d){ return d.store}).entries(this.transformedData);
    nest.forEach( elem => this.shops.push(elem.key));
  }

  getFacts() {
    let nest = d3.nest().key(function(d){ return d.FACTS}).entries(this.transformedData);
    nest.forEach( elem => this.facts.push(elem.key));
    this.selectedFact = this.facts[0];
    this.chartReady = true;
  }

  setFactSelected(fact: string) {
    this.selectedFact = fact.text;
    console.log(fact, this.selectedFact);
    this.redraw();
    
  }

  setCustTypeSelected(custType : string) {
    this.selectedCustType = custType.text;
    this.change();
  }

  getDatafromTransformed(fact: string, custType: string) {
    return this.transformedData.filter( elem => elem["FACTS"] === fact)
                .filter( elem => elem["list"] === custType);
            //    .filter( elem => elem["store"] === this.selectedShop);
  }

  toggle() {
    this.includeNational = !this.includeNational;
    this.change();
  }




  createSvg() {
    
    let margin = {top: 30, right: 200, bottom: 80, left: 75},
        width = 1100 - margin.left - margin.right,
        height = 670 - margin.top - margin.bottom;
    
    var svg : any = d3.select(this.elementRef.nativeElement)
      .select("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
      .append("g")
        .attr("transform","translate("+ margin.left + "," + margin.top + ")");

    this.options = { margin: margin, width: width, height: height, svg:svg};
  
    svg.append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#ffffff");

 //make a clip path for the graph  
    var clip = svg.append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);  
  }


 change() {
   console.log("change!");
    d3.transition()
      .duration(1000)
      .each(() => {return this.redraw()});
  }

  
  redraw(){

    let dataTr = this.getDatafromTransformed(this.selectedFact, this.selectedCustType);
    console.log(dataTr);
    let parseTime : any = d3.timeParse("%b %Y");

    var data = d3.nest()
      .key(function(d) { return d.store; })
      .map(dataTr);

      console.log(data);


    if (!this.includeNational){
      data.remove("National");
    }

    var color = d3.scaleOrdinal().range(
      this.colourService.colors.blues.slice(0,this.shops.length)
    );
    
    let svg = this.options.svg;
    let margins = this.options.margins;

    color.domain(data.keys());

   
    var lineData = color.domain().map( elem => {
      return {
        name: elem,
        values: data.get(elem).map( (d) => {
          return {name:d.store, date: d.date, value: parseFloat(d.val ? d.val : "0")}
        })
      }
    });

   
    var tmp = [];
      lineData.forEach( (elem) => tmp = tmp.concat(elem.values));

      let x = d3.scaleTime()
        .range([0, this.options.width])
        .domain(d3.extent(tmp, function(d){return d.date }));



       let y = d3.scaleLinear()
        .range([this.options.height, 0])
        .domain([0, d3.max(tmp, function(d){return parseFloat(d.value ? d.value : 0) })]);

    var lastvalues=[];
    color.domain().forEach( (elem) => lastvalues.push(parseFloat(data.get(elem)[data.get(elem).length-1].val)));
    
    let xAxis = d3.axisBottom(x)
                  .tickPadding(8)
                  .ticks(5);

    let yAxis = d3.axisLeft(y)
                  .tickPadding(8);

    svg.append("svg:g")
      .attr("class", "x axis");

    svg.append("svg:g")
      .attr("class", "y axis");




    var line = d3.line()
      .x(function(d) {return x(d.date)})
      .y(function(d) {return y(d.value)});



    var theGraph = svg.selectAll(".thegraph")
      .data(lineData);

    var theGraphEnter = theGraph.enter().append("g")
      .attr("clip-path", "url(#clip)") //*
      .attr("class", "thegraph") //*
      .attr("id", function(d) {
        return d.name+"-line";
      })
      .style("stroke-width", 2.5)
      .attr("fill", "none")
      .on("mouseover", function(d) {
        d3.select(this)
          .style("stroke-width", "6px");

          var selectthegraphs = $('.thegraph').not(this);

          d3.selectAll(selectthegraphs)
            .style("opacity", 0.2);

          var getName = document.getElementById(d.name);
          var selectlegend = $('.legend').not(getName); 

          d3.selectAll(selectlegend)    // drop opacity on other legend names
            .style("opacity",.2);

          d3.select(getName)
            .attr("class", "legend-select");
          
      })
      .on("mouseout",  function(d) {        //undo everything on the mouseout
          d3.select(this)
            .style("stroke-width",'2.5px');
          
          var selectthegraphs = $('.thegraph').not(this);
          d3.selectAll(selectthegraphs)
            .style("opacity",1);
          
          var getname = document.getElementById(d.name);
          var getname2= $('.legend[fakeclass="fakelegend"]')
          var selectlegend = $('.legend').not(getname2).not(getname);

          d3.selectAll(selectlegend)
            .style("opacity",1);
          
          d3.select(getname)
            .attr("class", "legend");          
      });

    theGraphEnter.append("path")
      .attr("class", "line")
      .style("stroke", function(d) { return color(d.name); })
      .attr("d", function(d) { 

        return line(d.values[0]); })

      .transition()
      .duration(2000)
      .attrTween('d',function (d){
        var interpolate = d3.scaleQuantile()
          .domain([0,1])
          .range(d3.range(1, d.values.length+1));

        return function(t){
          return line(d.values.slice(0, interpolate(t)));
        };
      });

      
    theGraphEnter.selectAll("circle")
      .data( function(d) {return(d.values);} )
      .enter()
      .append("circle")
      .attr("class","tipcircle")
      .attr("cx", function(d,i){return x(d.date)})
      .attr("cy",function(d,i){return y(d.value)})
      .attr("r",12)
      .style('opacity', 1e-6)
      .attr('fill', "blue")
      .attr("title", function(d,i){
        var NumbType = d3.format(",.2f");  
        var formatDate = d3.timeFormat("%b %d, '%y");         
        let tip = '<h4 class="tip1">' + d.name + '</h4><h5 class="tip2">' + NumbType(d.value) + '</h5> <p class="tip3">'+  formatDate(d.date)+'</p>';
        return tip;
      });


    var legend = svg.selectAll('.legend')
      .data(lineData, function(d){ return d.name});


    var legendEnter=legend
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('id',function(d){ return d.name; })
      .on('click', function (d) {                           //onclick function to toggle off the lines          
          if($(this).css("opacity") == 1){  
   //uses the opacity of the item clicked on to determine whether to turn the line on or off          

            var elemented = document.getElementById(this.id +"-line");   //grab the line that has the same ID as this point along w/ "-line"  use get element cause ID has spaces
            d3.select(elemented)
              .transition()
              .duration(500)
              .style("opacity",0)
               .style("display",'none');
          
            d3.select(this)
              .attr('fakeclass', 'fakelegend')
             .transition()
              .duration(500)
              .style ("opacity", .2);
          } else {
          
            var elemented = document.getElementById(this.id +"-line");
            d3.select(elemented)
              .style("display", "block")
              .transition()
              .duration(500)
              .style("opacity",1);
          
            d3.select(this)
              .attr('fakeclass','legend')
              .transition()
              .duration(1000)
              .style ("opacity", 1);
          }
      });

   
    let tmpRange = [0,30,60,90,120,150,180,210,240,270,300,330,360,390];

    lastvalues.sort(function(a,b){return b-a});

    var legendscale= d3.scaleOrdinal()
        .domain(lastvalues)
        .range(tmpRange.slice(0, lastvalues.length ));


  //actually add the circles to the created legend container
     
   
    //  .attr("cy", function(d){return legendscale(d.values[d.values.length-1].value);})
    d3.selectAll(".legend-circle").transition().duration(100).remove();
    d3.selectAll(".legend-text").remove();

    svg.selectAll('.legend')
      .data(lineData, function(d){ return d.name})
        .append("circle")
        .attr("class", "legend-circle")
        .attr('cx', this.options.width +20)
        .attr('class', 'legend-circle')
        .attr('cy', function(d){
          console.log(d.values[d.values.length-1].value +" =>" + legendscale(d.values[d.values.length-1].value))
          return legendscale(d.values[d.values.length-1].value);})
        .attr('r', 7)
        .style("fill", "blue")
        .transition()
        .duration(300)
        .style('fill', function(d) { 
            return color(d.name);
        });
                    
  //add the legend text
    svg.selectAll('.legend')
      .data(lineData, function(d){ return d.name})
      .append('text')
      .style("fill","white")
      .attr("class", "legend-text")
      .attr('x', this.options.width+35)
      .attr('y', function(d){return legendscale(d.values[d.values.length-1].value);})
      .text(function(d){ return d.name; })
      .transition()
      .duration(300)
      .style("fill", "black");


     d3.selectAll(".legend-circle")
      .exit().remove();

   // set variable for updating visualization
    var thegraphUpdate = d3.transition(theGraph);



    // update the axes,   
    d3.selectAll(".line")
      .data(lineData)
      .transition()
      .duration(1000)
      .attr("d", function(d){ return line(d.values)});

    theGraph.selectAll("circle")
      .data( function(d) {return(d.values);} )
      .attr("title",function(d,i){
        var NumbType = d3.format(",.2f");  
        var formatDate = d3.timeFormat("%b %d, '%y");         
        let tip = '<h4 class="tip1">' + d.name + '</h4><h5 class="tip2">' + NumbType(d.value) + '</h5> <p class="tip3">'+  formatDate(d.date)+'</p>';
        return tip;
      })
      .attr("cy", function(d,i) {return y(d.value);})
      .attr("cx", function(d,i) {return x(d.date);});
      
      $('g circle.tipcircle').tipsy({opacity:.9, gravity:'n', html:true});

      d3.transition(svg).select(".y.axis")
        .call(yAxis);   
          
      d3.transition(svg).select(".x.axis")
        .attr("transform", "translate(0," + this.options.height + ")")
        .call(xAxis);

  }
}
