function init(){
  buildMap();
}

function buildMap(){

  let width = 1200;
  let height = 600;

  let projection = d3.geoAlbersUsa()
    .translate([width/2, height/2])
    .scale([1000]);

  let path = d3.geoPath()
  //   .projection(projection)

  let svg = d3.select("#map").append('svg')
    .attr("width", width)
    .attr("height", height)


  d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    svg.append("g")
        .attr("class", "states")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
        .attr("d", path);

    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
  });

  // let lat = "30.2229723";
  // let long = "-97.7701519"
  //
  // console.log(projection([long, lat]))

  d3.json("data/processed_data.json", function(data){
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d =>{
        let loc = projection([d.lng, d.lat]);
        if(loc != null){
          return loc[0]
        }
      })
      .attr("cy", d =>{
        let loc = projection([d.lng, d.lat]);
        if(loc != null){
          return loc[1]
        }
      })
      .attr("r", "7")
  });

}
