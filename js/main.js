//Main.js for D3 Lab
//Brody W. Manquen 3/11/2020

window.onload = setMap();

function setMap(){
  var promises = [d3.csv("data/chicagoCensus.csv"),
                  d3.json("data/chicagoCensusTopoJSON.json")
                ];
  Promise.all(promises).then(callback);

  function callback(data){
    csvData = data[0];
    chicagoZIP = data[1];
    //console.log(csvData);
    //console.log(chicagoZIP);
    var chicagoZIPcodes = topojson.feature(chicagoZIP, chicagoZIP.objects.chicagoCensus)
    console.log(chicagoZIPcodes)
};
}
