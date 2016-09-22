import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoadDataService } from './load-data.service';
import { ColorService } from './colorservice.service';  

import * as d3 from 'd3';

//import * as $ from 'jquery';

declare var $:JQueryStatic;

import { Subscription } from 'rxjs/Subscription';



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

  selectedShop;
  selectedFact;
  selectedCustType;

  subscriptionInitialData: Subscription; 
  subscriptionTransformedData: Subscription; 

  ready : boolean = false;

  @ViewChild('chartArea') svgElement: HTMLElement;

  constructor(private lds : LoadDataService, private colourService: ColorService, private elementRef : ElementRef) { }

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
      }

    )

  	
 }

  ngAfterViewInit() {

    console.log("viewInit");
    this.createTooltip();
    this.createSvg();


  }

  getFilterOptions() {

    this.getFacts();

    this.getCustomerTypes();
    this.setCustTypeSelected(this.custTypes[0]);

    this.getShopNames();
    this.setShopSelected(this.shops[0]);
    this.ready = true;

  }

  getCustomerTypes() {
    let nest = d3.nest().key(function(d){ return d.list}).entries(this.transformedData);
    nest.forEach( elem => this.custTypes.push(elem.key));
  }

  getShopNames() {
    let nest = d3.nest().key(function(d){ return d.store}).entries(this.transformedData);
    nest.forEach( elem => this.shops.push(elem.key));
  }

  getFacts() {
    let nest = d3.nest().key(function(d){ return d.FACTS}).entries(this.transformedData);
    nest.forEach( elem => this.facts.push(elem.key));
  }

  setFactSelected(fact: string) {
    this.selectedFact = fact;
    this.change();
    
  }

  setShopSelected(shop: string) {
    this.selectedShop = shop;
  }

  setCustTypeSelected(custType : string) {
    this.selectedCustType = custType;
    this.change();
  }

  getDatafromTransformed(fact: string, custType: string) {
    return this.transformedData.filter( elem => elem["FACTS"] === fact)
                .filter( elem => elem["list"] === custType);
            //    .filter( elem => elem["store"] === this.selectedShop);
  }




  createSvg() {

    
    let margin = {top: 50, right: 160, bottom: 80, left: 150},
        width = 1300 - margin.left - margin.right,
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

    

 //   svg.call(d3.zoom().on("wheel", zoomed));

    
  }

  change() {

    d3.transition()
      .duration(1000)
      .each(() => {return this.redraw()});
  }
  
  redraw(){

    let dataTr = this.getDatafromTransformed(this.selectedFact, this.selectedCustType);

    console.log("creating chart...");
    console.log(dataTr);
 
    var parseTime : any = d3.timeParse("%b %Y");

    let x = d3.scaleTime()
        .range([0, this.options.width])
        .domain(d3.extent(dataTr, function(d){return d.date }));

       let y = d3.scaleLinear()
        .range([this.options.height, 0])
        .domain([0, d3.max(dataTr, function(d){return parseFloat(d.val ? d.val : 0) })]);

    console.log([0, d3.max(dataTr, function(d){return parseFloat(d.val ? d.val : 0)  })]);

    var data = d3.nest()
      .key(function(d) { return d.store; })
      .map(dataTr);


    var color = d3.scaleOrdinal().range(
      this.colourService.colors.blues.slice(0,this.shops.length)
    );
    
    let svg = this.options.svg;
    let margins = this.options.margins;

    let xAxis = d3.axisBottom(x)
                  .tickPadding(8)
                  .ticks(5);

    let yAxis = d3.axisLeft(y)
                  .tickPadding(8);

    svg.append("svg:g")
      .attr("class", "x axis");

    svg.append("svg:g")
      .attr("class", "y axis");



  //  console.log(data.keys());

    color.domain(data.keys());

 //   console.log(data.get(color.domain()[0]));
    
    var lineData = color.domain().map( elem => {
      return {
        name: elem,
        values: data.get(elem).map( (d) => {
          return {name:d.store, date: d.date, value: parseFloat(d.val ? d.val : "0")}
        })
      }
    });

    var lastvalues=[];

    color.domain().forEach( (elem) => lastvalues.push(parseFloat(data.get(elem)[data.get(elem).length-1].val)));



    

    var line = d3.line()
      .x(function(d) {return x(d.date)})
      .y(function(d) {return y(d.value)});

  //  console.log(lineData);


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
        console.log("in theGraphEnter.apend('path')");
        console.log(d.values);
        console.log(d.values[0]);
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

      
    theGraph.selectAll("circle")
      .data( function(d) {return(d.values);} )
      .enter()
      .append("circle")
      .attr("class","tipcircle")
      .attr("cx", function(d,i){return x(d.date)})
      .attr("cy",function(d,i){return y(d.value)})
      .attr("r",12)
      .style('opacity', 0.5);

    var legend = svg.selectAll('.legend')
      .data(lineData);

    var legendEnter=legend
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('id',function(d){ return d.name; })
      .on('click', function (d) {                           //onclick function to toggle off the lines          
          if($(this).css("opacity") == 1){  
            console.log($(this));        //uses the opacity of the item clicked on to determine whether to turn the line on or off          

            var elemented = document.getElementById(this.id +"-line");   //grab the line that has the same ID as this point along w/ "-line"  use get element cause ID has spaces
            d3.select(elemented)
              .transition()
              .duration(1000)
              .style("opacity",0)
               .style("display",'none');
          
            d3.select(this)
              .attr('fakeclass', 'fakelegend')
             .transition()
              .duration(1000)
              .style ("opacity", .2);
          } else {
          
            var elemented = document.getElementById(this.id +"-line");
            d3.select(elemented)
              .style("display", "block")
              .transition()
              .duration(1000)
              .style("opacity",1);
          
            d3.select(this)
              .attr('fakeclass','legend')
              .transition()
              .duration(1000)
              .style ("opacity", 1);
          }
      });


    

    

    var legendscale= d3.scaleOrdinal()
        .domain(lastvalues)
        .range([0,30,60,90,120,150,180,210]);



  //actually add the circles to the created legend container
    legendEnter.append('circle')
        .attr('cx', this.options.width +20)
        .attr('cy', function(d){return legendscale(d.values[d.values.length-1].value);})
        .attr('r', 7)
        .style('fill', function(d) { 
            return color(d.name);
        });
                    
  //add the legend text
    legendEnter.append('text')
        .attr('x', this.options.width+35)
        .attr('y', function(d){return legendscale(d.values[d.values.length-1].value);})
        .text(function(d){ return d.name; });

   // set variable for updating visualization
    var thegraphUpdate = d3.transition(theGraph);

 
    // update the axes,   
    d3.selectAll(".line")
      .data(lineData)
      .transition()
      .duration(1000)
      .attr("d", function(d){ return line(d.values)});
      

    d3.transition(svg).select(".y.axis")
      .call(yAxis);   
          
    d3.transition(svg).select(".x.axis")
      .attr("transform", "translate(0," + this.options.height + ")")
        .call(xAxis);



  
     function zoomed() {
 
      svg.select(".x.axis").call(xAxis);
      svg.select(".y.axis").call(yAxis);

    svg.selectAll(".tipcircle")
      .attr("cx", function(d,i){return x(d.date)})
      .attr("cy",function(d,i){return y(d.value)});
      
    svg.selectAll(".line")
        .attr("class","line")
          .attr("d", function (d) { return line(d.values)});
    }
  }


  createTooltip(){
    (function($) {

  var nvtooltip = window.nvtooltip = {};

  nvtooltip.show = function(pos, content, gravity, dist) {
    var container = $('<div class="nvtooltip">');

    gravity = gravity || 's';
    dist = dist || 20;

    container
      .html(content)
      .css({left: -1000, top: -1000, opacity: 0})
      .appendTo('body');

    var height = container.height() + parseInt(container.css('padding-top'))  + parseInt(container.css('padding-bottom')),
        width = container.width() + parseInt(container.css('padding-left'))  + parseInt(container.css('padding-right')),
        windowWidth = $(window).width(),
        windowHeight = $(window).height(),
        scrollTop = $('body').scrollTop(),  //TODO: also adjust horizontal scroll
        left, top;


    //TODO: implement other gravities
    switch (gravity) {
      case 'e':
      case 'w':
      case 'n':
        left = pos[0] - (width / 2);
        top = pos[1] + dist;
        if (left < 0) left = 5;
        if (left + width > windowWidth) left = windowWidth - width - 5;
        if (scrollTop + windowHeight < top + height) top = pos[1] - height - dist;
        break;
      case 's':
        left = pos[0] - (width / 2);
        top = pos[1] - height - dist;
        if (left < 0) left = 5;
        if (left + width > windowWidth) left = windowWidth - width - 5;
        if (scrollTop > top) top = pos[1] + dist;
        break;
    }

    container
        .css({
          left: left,
          top: top,
          opacity: 1
        });
  };

  nvtooltip.cleanup = function() {
    var tooltips = $('.nvtooltip');

    // remove right away, but delay the show with css
    tooltips.css({
        'transition-delay': '0 !important',
        '-moz-transition-delay': '0 !important',
        '-webkit-transition-delay': '0 !important'
    });

    tooltips.css('opacity',0);

    setTimeout(function() {
      tooltips.remove()
    }, 500);
  };

})($);
  }
 
}
