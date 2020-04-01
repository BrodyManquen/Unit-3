//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020

window.onload = setMap();

function setMap(){

  var width = 960,
    height = 460;

    //create new svg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

      //create Albers equal area conic projection centered on Chicago
  var projection = d3.geoAlbers()
        .center([-86.95, 41.9])
        .rotate([1,0])
        .parallels([-87.36, 42.33])
        .scale(69000)
        .translate([width / 2, height / 2]);

  var path = d3.geoPath()
        .projection(projection);

  var promises = [d3.csv("data/chicagoCensus.csv"),
                  d3.json("data/chicagoCensusTopoJSON.json"),
                  d3.json("data/usaTopo.json")
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData = data[0];
    chicagoZIP = data[1];
    usa = data[2];
    var chicago = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus).features  //converts chicagoZIP to geoJSON
    var usaBase = topojson.feature(usa, usa.objects.gz_2010_us_040_00_500k)
    //add Chicago tracts countries to map
    var base = map.append("path") //US State basemap
      .datum(usaBase)
      .attr("class", "base")
      .attr("d", path);

    var tract = map.selectAll(".tract")  //Census Tract shapes and bounds
    .data(chicago)
    .enter()
    .append("path")
    .attr("class", function(d){
        return "tract " + d.properties.name10;  //names after census tract
    })
    .attr("d", path);
};
}
