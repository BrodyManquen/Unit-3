//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020

window.onload = setMap();

function setMap(){

  var width = 600,
    height = 460;

    //create new svg container for the map
  var map = d3.select("body")
      .append("svg")
      .attr("class", "map")
      .attr("width", width)
      .attr("height", height);

      //create Albers equal area conic projection centered on Chicago
  var projection = d3.geoAlbers()
        .center([-86.75, 41.855])
        .rotate([1,0])
        .parallels([-87.36, 42.33])
        .scale(69000)
        .translate([width / 2, height / 2]);

  var path = d3.geoPath()
        .projection(projection);

  var promises = [d3.csv("data/chicagoCensus.csv"),
                  d3.json("data/chicagoTopo.json"),
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
    //graticule
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
