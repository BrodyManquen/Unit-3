//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020

window.onload = function(){
//sample city data
  var cityPop = [
    {
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    },
    {
        city: 'Superior',
        population: 27244
    }
  ];
  //find the minimum value of the array
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    });
    //find the maximum value of the array
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    });
  //SVG dimension variables
  var w = 900, h = 500;

  var container = d3.select("body") //get the <body> element from DOM
    .append('svg')
    .attr('width', w) //assigns w to width
    .attr('height', h) //assigns h to height
    .attr("class", "container") //assigns class name
    .style("background-color", "rgba(5,5,30,0.4)");

  var innerRect = container.append("rect") //put rect in svg
  .datum(400) //a single value is a DATUM
      .attr("width", function(d){ //rectangle width
          return d * 2; //400 * 2 = 800
      })
      .attr("height", function(d){ //rectangle height
          return d; //400
      })
      .attr("class", "innerRect") //class name
      .attr("x", 50) //position from left on the x (horizontal) axis
      .attr("y", 50) //position from top on the y (vertical) axis
      .style("fill", "#FFFFFF"); //fill color

  //var dataArray = [10, 20, 30, 40, 50];
  var x = d3.scaleLinear() //create the scale
        .range([90, 810]) //output min and max
        .domain([0, 3]); //input min and max
        //scale for circles center y coordinate
  var y = d3.scaleLinear()
        .range([440, 95])
        .domain([
          minPop,
          maxPop
          ]);
  var circles = container.selectAll(".circles") //but wait--there are no circles yet!
      .data(cityPop) //here we feed in an array
      .enter() //one of the great mysteries of the universe
      .append("circle")
      .attr("class", "circles")
      .attr('id', function(d){
        return d.city;
      })
      .attr('r', function(d){  //sets radius
        var area = d.population*0.01;
        return Math.sqrt(area/Math.PI); //sets radius equal to sqrt area/pi
       })
      .attr("cx", function(d, i){
        return x(i);
        //return 90+(i*180);
      })
      .attr("cy", function(d, i){
        return y(d.population);
      })
  console.log(innerRect)
  console.log(container)
};
