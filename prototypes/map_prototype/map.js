// TODO: Provide a "filtered" function that changes breweries' colors
// TODO: Provide a "filtered" function that changes a selected breweries' colors
// TODO: Brushing.
// TODO: Zooming. 
// TODO: Cosmetic Stuff

class Map {

  constructor(){
    this.svg = d3.select("#map")

    this.width = parseInt(this.svg.attr("width"));
    this.height = parseInt(this.svg.attr("height"));

    this.projection = d3.geoAlbersUsa()
      .translate([this.width/2, this.height/2])
      .scale([1200]);
  }

  buildMap(data){
    let path = d3.geoPath()
      .projection(this.projection)

    d3.json("data/us-states.json", function(error, us) {
        if (error) throw error;

        d3.select("#mapLayer").selectAll("path")
          .data(us.features)
          .enter().append("path")
            .attr("d", path)
            .attr("class", "state");
    });


    d3.select("#breweryLayer").selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d =>{
        let loc = this.projection([d.lng, d.lat]);
        if(loc != null){
          return loc[0]
        }
      })
      .attr("cy", d =>{
        let loc = this.projection([d.lng, d.lat]);
        if(loc != null){
          return loc[1]
        }
      })
      .attr("r", "3")
      .attr("class", "filtered")
      .append("title")
      .text(d => d.brewery_name);
  }

  updateFiltered(ids){
    // TODO
  }

  updateSelected(ids){
    // TODO
  }
}
