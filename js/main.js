//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020
//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){
//pseudo-global variables
var attrArray = ["OwnPercent", "%Rented","Gini"]; //list of attributes
var expressed = attrArray[2]; //initial attribute
var compared = attrArray[1]
window.onload = setMap();

function setMap(){

  var width = window.innerWidth*0.5,
    height = 800;

    //create new svg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

  //create Albers equal area conic projection centered on Chicago
  var projection = d3.geoAlbers()
        .center([8.25, 41.88205])
        .rotate([92.35,0.5,-4])
        .parallels([40,45])
        .scale(99000)
        .translate([width / 2, height / 2]);

  var path = d3.geoPath()
        .projection(projection);

  var promises = [d3.csv("data/chicagoCensus.csv"),
                  d3.json("data/chicagoTopo.json"),
                  d3.json("data/ilTopo.json"),
                  d3.json("data/inTopo.json")
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData = data[0];
    chicagoZIP = data[1];
    il = data[2];
    ind = data[3];
    setGraticule(map, path);

    var chicago = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus).features  //converts chicagoZIP to geoJSON
    var ilBase = topojson.feature(il, il.objects.cb_2015_illinois_county_20m) //converts usa Basemap to geoJSON
    var indBase = topojson.feature(ind, ind.objects.cb_2015_indiana_county_20m)
    //Add basemap and Chicago tracts to map
    var base = map.append("path") //US State basemap
        .datum(ilBase)
        .attr("class", "base")
        .attr("d", path)
    var mapTitle = map.append("text")  //map Title
        .attr("x", 40)
        .attr("y", 20)
        .attr("class", "mapTitle")
        .text("Gini Coefficient in each Chicago Census Tract");
    var indiana = map.append("path") //US State basemap
            .datum(indBase)
            .attr("class", "base")
            .attr("d", path);
    //join csv data to geojson enum units
    chicago = joinData(chicago, csvData);
    //create the color scale
    var colorScale = makeColorScale(csvData);
    //add enumeration units (Chicago Census Tracts)
    setEnumerationUnits(chicago, map, path, colorScale);
    //addChart
    setChart(csvData, colorScale);
  };
};
//creates Map graticule
function setGraticule(map, path){
  var graticule = d3.geoGraticule()
      .step([0.25,0.25]);  // place graticule line every 5 degrees

      //create graticule background
  var gratBackground = map.append("path")
      .datum(graticule.outline()) //bind graticule background
      .attr("class", "gratBackground") //assign class for styling
      .attr("d", path) //project graticule

      //create graticule lines
  var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
      .data(graticule.lines()) //bind graticule lines to each element to be created
      .enter() //create an element for each datum
      .append("path") //append each element to the svg as a path element
      .attr("class", "gratLines") //assign class for styling
      .attr("d", path); //project graticule lines
};
//joins attribute csv and geoJSON tract data
function joinData(chicago, csvData){
//loop through csv to assign each set of csv attribute values to geojson region
  for (var i=0; i<csvData.length; i++){
    var csvTract = csvData[i]; //the current region
    var csvKey = csvTract.name10; //the CSV primary key

  //loop through geojson regions to find correct region
  for (var a=0; a<chicago.length; a++){
      var geojsonProps = chicago[a].properties; //the current region geojson properties
      var geojsonKey = geojsonProps.name10; //the geojson primary key
      //where primary keys match, transfer csv data to geojson properties object
      if (geojsonKey == csvKey){
          //assign all attributes and values
          attrArray.forEach(function(attr){
              var val = parseFloat(csvTract[attr]); //get csv attribute value
              geojsonProps[attr] = val; //assign attribute and value to geojson properties
          });
      };
  };
  };
  return chicago;
};
//draws topoJSON enumeration units for chicago census tracts
function setEnumerationUnits(chicago, map, path, colorScale){
  //add USA basemap and Chicago Census Tracts to map
  var tract = map.selectAll(".tract")  //Census Tract shapes and bounds
    .data(chicago)
    .enter()
    .append("path")
    .attr("class", function(d){
        return "tract " + d.properties.name10;  //names after census tract
    })
    .attr("d", path)
    .style("fill", function(d){
      var value = d.properties[expressed];
      if (value){
        return colorScale(d.properties[expressed]);
      } else {
        return "#ccc";
      }
    });
};
//function to create color scale Generator
function makeColorScale(data){
  var colorClasses = [  //Made from ColorBrewer (purple)
    "#f2f0f7",
    "#cbc9e2",
    "#9e9ac8",
    "#6a51a3"
  ];
  //create color scale Generator
  var colorScale = d3.scaleQuantile()
    .range(colorClasses);
//Natural Breaks -- does not look as meaningful as Quantile
                  //  var domainArray = [];
                  //  for (var i=0; i<data.length;i++){
                  //    var val = parseFloat(data[i][expressed]);
                  //    domainArray.push(val);
                  //  };
                  //cluster data using ckmeans clustering
                  //  var clusters = ss.ckmeans(domainArray, 4);
                  //reset domain array to cluster mins
                  //  domainArray = clusters.map(function(d){
                  //    return d3.min(d);
                  //  });
                    //move first val from domain
                    //domainArray.shift();
                  //  colorScale.domain(domainArray);
                  //  return colorScale;
//build two-value array of minimum and maximum expressed attribute values
  var minmax = [
      d3.min(data, function(d) { return parseFloat(d[expressed]); }),
      d3.max(data, function(d) { return parseFloat(d[expressed]); })
  ];
//assign array of expressed values as scale domain
  colorScale.domain(minmax);
  return colorScale;  //sets colorScale
};
//create scatterplot comparing %houses rented to Gini Coefficient
function setChart(csvData, colorScale){
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 10, bottom: 60, left: 60};
  var width = (window.innerWidth * 0.425) - margin.left - margin.right,
      height = (window.innerHeight) - margin.left - margin.right,
      leftPadding = 25,
      rightPadding = 2,
      topBottomPadding = 25,
      chartInnerWidth = width - leftPadding - rightPadding,
      chartInnerHeight = height - topBottomPadding * 2,
      translate = "translate(" + leftPadding + "," + topBottomPadding + ")"
  // append the svg object to the body of the page
  var chart = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");
  //create a rectangle for chart background fill
  var chartBackground = chart.append("rect")
      .attr("class", "chartBackground")
      .attr("width", chartInnerWidth)
      .attr("height", height)
      .attr("transform", translate);
  var yScale = d3.scaleLinear() //y scale for axis
            .range([height, 0])
            .domain([0, 1]);
  var xScale = d3.scaleLinear() //x scale for axis
            .range([width, 0])
            .domain([1, 0]);
    // Add X axis
    var x = d3.scaleLinear()  //x range
      .domain([0, 1])
      .range([ 0, width ])
    // Add Y axis
    var y = d3.scaleLinear()  //y range
      .domain([0, 1])
      .range([ height, 0]);
    // Add dots for Scatterplot
    var dots = chart.selectAll(".dot")
      .data(csvData)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d[expressed]); } ) //sets Gini as X
        .attr("cy", function (d) { return y(d[compared]); } )  //sets %Rent as Y
        .attr("r", 2.5)  //controls size of dots
        .attr("class", function(d){
            return "tract " + d.name10  //gives each dot the name of associated tract -- not added to graph for clarity
          })
        .style("fill", function(d){
            var value = d[expressed];
            if(value) {
              return colorScale(d[expressed]);
            } else {
              return "#ccc";
            }})
      .attr("transform", translate);
    var chartTitle = chart.append("text")  //chart Title
        .attr("x", 40)
        .attr("y", 20)
        .attr("class", "chartTitle")
        .text(compared + " Houses (Y) vs " + expressed + " Coefficient (X)");
        //create vertical axis generator
    var yAxis = d3.axisLeft()  //4 variables to finish axes
        .scale(yScale);
    var xAxis = d3.axisBottom()
        .scale(xScale);
        //place axis
    var yAx = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis)
    var xAx = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(xAxis);

}
})();
