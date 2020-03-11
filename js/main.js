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

    //color scale generation
    var color = d3.scaleLinear()
          .range([
            "#FDBE85",
            "#D94701"
          ])
          .domain([
            minPop,
            maxPop
          ]);
  //SVG dimension variables
  var w = 900, h = 500;

  var container = d3.select("body") //get the <body> element from DOM
    .append('svg')
    .attr('width', w) //assigns w to width
    .attr('height', h) //assigns h to height
    .attr("class", "container") //assigns class name
    .style("background-color", "rgba(0,0,0,0.2)");

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
        .range([90, 760]) //output min and max
        .domain([0, 3]); //input min and max
        //scale for circles center y coordinate
  var y = d3.scaleLinear() //y-scale (linear)
        .range([450, 50])
        .domain([0, 700000]);
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
      .style("fill", function(d, i){ //color fill from color scale
        return color(d.population)
      })
      .style("stroke", "#000"); //black stroke on circle

  var yAxis = d3.axisLeft(y);
  var axis = container.append("g") //create axis g element
    .attr("class", "axis")
    .attr("transform", "translate(50,0)") //pushes axis to right to fit
    .call(yAxis);

  var title = container.append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle") //sets text anchorpoint to mid, not left
    .attr("x", 450)
    .attr("y", 30)
    .text("Wisconsin City Populations"); //sets title, see style.css for setup
  //create format generator
  var format = d3.format(",");
  //create labels
  var labels = container.selectAll(".labels")
    .data(cityPop)
    .enter()
    .append("text")
    .attr("class", "labels")
    .attr("text-anchor", "left")
    .attr("y", function(d){
      //vertical position of label on each circle
      return y(d.population)
    });
  //first line of labels
  var nameLine = labels.append("tspan")
    .attr("class", "nameLine")
    .attr("x", function(d,i){
      //horizontal position of labels
      return x(i)+Math.sqrt(d.population*0.01/Math.PI)+5;
    })
    .text(function(d){
      return d.city;
    });
  //second line of labels
  var popLine = labels.append("tspan")
    .attr("class", "popLine")
    .attr("x", function(d,i){
      //horizontal positon of labels
      return x(i)+Math.sqrt(d.population*0.01/Math.PI)+5;
    })
    .attr("dy", "15") //vertical offset
    .text(function(d){
      return "Pop. " + format(d.population);
    });

  console.log(innerRect)
  console.log(container)
};
