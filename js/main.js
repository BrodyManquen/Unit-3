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

    //variables for data join
    var attrArray = ["2More", "2MoreOwn", "2MoreRent", "35-44", "35-44Own","35-44Rent","45-54","45-54Own","45-54Rent","55-64","55-64Own","55-64Rent","65-74","65-74Own","65-74Rent","75-84","75-84Own","75-84Rent","85over","85overOwn","85overRent","AmInd","AmIndOwn","AmIndRent","Asian","AsianOwn","AsianRent","Black","BlackOwn","BlackRent","Gini","Hispanic","HispanicOwn","HispanicRent","NatHaw","NatHawOwn","NatHawRent","Other","OtherOwn","Own","Rent","White","WhiteOwn", "WhiteRent", "allHouse", "under35", "under35Own", "under35Rent"];
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
      var csvTract = csvData[i]; //the current region
      var csvKey = csvTract.tractce10; //the CSV primary key

    //loop through geojson regions to find correct region
    for (var a=0; a<chicago.length; a++){
        var geojsonProps = chicago[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.tractce10; //the geojson primary key
        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey == csvKey){
            //assign all attributes and values
            attrArray.forEach(function(attr){
                var val = parseFloat(csvTract[attr]); //get csv attribute value
                geojsonProps[attr] = val; //assign attribute and value to geojson properties
      console.log(geojsonProps)
            });
        };
    };
};

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
