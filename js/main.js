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

      //create Albers equal area conic projection centered on France
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
    var chicagoZIPcodes = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus)
    console.log(chicagoZIPcodes)
    console.log(usa)
    var chicago = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus)
    var usa = topojson.feature(usa, usa.objects.gz_2010_us_040_00_500k)
    //add Europe countries to map
    var base = map.append("path")
      .datum(usa)
      .attr("class", "base")
      .attr("d", path);

    var zips = map.selectAll(".zips")
    .data(chicagoZIP)
    .enter()
    .append("path")
    .attr("class", function(d){
        return "zips " + d.properties.tractce10;
    })
    .attr("d", path);
};
}
