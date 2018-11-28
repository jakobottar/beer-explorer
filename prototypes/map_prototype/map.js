function init(){
  buildMap();
}

// TODO: Put in class, with constructor and such
// TODO: Provide a "filtered" function that changes breweries' colors
// TODO: Provide a "filtered" function that changes a selected breweries' colors
// TODO: Brushing.
// TODO: Cosmetic Stuff

function buildMap(){
  let svg = d3.select("#map")
  let width = parseInt(svg.attr("width"));
  let height = parseInt(svg.attr("height"));

  let projection = d3.geoAlbersUsa()
    .translate([width/2, height/2])
    .scale([1200]);

  let path = d3.geoPath()
    .projection(projection)

  d3.json("data/us-states.json", function(error, us) {
      if (error) throw error;


      d3.select("#mapLayer").selectAll("path")
        .data(us.features)
        .enter().append("path")
          .attr("d", path);
    });

    d3.json("data/processed_data.json", function(data){
      d3.select("#breweryLayer").selectAll("circle")
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
        .attr("r", "3")
        .attr("class", "filtered")
        .append("title")
        .text(d => d.brewery_name)
    });

}
