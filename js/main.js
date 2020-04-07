//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020
//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){
//pseudo-global variables
var attrArray = ["2More", "2MoreOwn", "2MoreRent", "35-44", "35-44Own","35-44Rent","45-54","45-54Own","45-54Rent","55-64","55-64Own","55-64Rent","65-74","65-74Own","65-74Rent","75-84","75-84Own","75-84Rent","85over","85overOwn","85overRent","AmInd","AmIndOwn","AmIndRent","Asian","AsianOwn","AsianRent","Black","BlackOwn","BlackRent","Gini","Hispanic","HispanicOwn","HispanicRent","NatHaw","NatHawOwn","NatHawRent","Other","OtherOwn","Own","Rent","White","WhiteOwn", "WhiteRent", "allHouse", "under35", "under35Own", "under35Rent"]; //list of attributes
var expressed = attrArray[30]; //initial attribute
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
        .attr("d", path);
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
  var colorClasses = [
    "#D4B9DA",
    "#C994C7",
    "#DF65B0",
    "#DD1C77",
    "#980043"
  ];
  //create color scale Generator
  var colorScale = d3.scaleQuantile()
    .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
    //assign array of expressed values as scale domain
    colorScale.domain(minmax);
    console.log(colorScale.quantiles())
    return colorScale;
}
//create coordianted bar chart
function setChart(csvData, colorScale){
  //chart frame dimensions
  var chartWidth = window.innerWidth * 0.425,
      chartHeight = 460
  //2nd svg to hold
  var chart = d3.select("body")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");
    //create a scale to size bars proportionally to frame
  var yScale = d3.scaleLinear()
    .range([0, chartHeight])
    .domain([0, 1]);

  var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a,b){
          return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.name10;
        })
        .attr("width", (chartWidth / (csvData.length - 1)))
        .attr("x", function(d, i){
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function(d){
          return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
          return chartHeight - yScale(parseFloat(d[expressed]));
        })
        .style("fill", function(d){
          return colorScale(d[expressed])
        });
    var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return a[expressed]-b[expressed]
        })
        .attr("class", function(d){
            return "numbers " + d.name10;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function(d){
            return chartHeight - yScale(parseFloat(d[expressed])) + 15;
        })
        .text(function(d){
            return d[expressed];
        });
        //below Example 2.8...create a text element for the chart title
    var chartTitle = chart.append("text")
            .attr("x", 20)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text(expressed + " Coefficient in each Chicago Census Tract");
}
})();
