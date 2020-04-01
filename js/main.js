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
        .center([-87.36, 42.33])
        .rotate([1,0])
        .parallels([-87.36, 42.33])
        .scale(21000)
        .translate([width / 2, height / 2]);

  var path = d3.geoPath()
        .projection(projection);

  var promises = [d3.csv("data/chicagoCensus.csv"),
                  d3.json("data/chicagoCensusTopoJSON.json")
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData = data[0];
    chicagoZIP = data[1];
    var chicagoZIPcodes = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus)
    console.log(chicagoZIPcodes)
    var chicago = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus)

    //add Europe countries to map
    var chicagobase = map.append("path")
      .datum(chicago)
      .attr("class", "chicago")
      .attr("d", path);


    var zips = map.selectAll(".zips")
    .data(chicagoZIPcodes)
    .enter()
    .append("path")
    .attr("class", function(d){
        return "zips" + d.properties.tractce10;
    })
    .attr("d", path);
};
}
