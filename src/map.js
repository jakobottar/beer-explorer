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
      .attr("id", d => `br_${d.brewery_id}`)
      .append("title")
      .text(d => d.brewery_name);
  }

  // Clears currently filtered items and colors passed-in ids
  updateFiltered(ids){ // NOTE: ids must be passed in as array
    d3.select("#breweryLayer") // de-filter everything
      .selectAll("circle")
      .classed("filtered", false)
      .classed("unselected", true);

    for(let i = 0; i < ids.length; i++){
      d3.select(`#br_${ids[i]}`)
        .classed("filtered", true)
        .classed("unselected", false);
    }
  }

  // Clears currently selected items and colors passed-in ids
  updateSelected(ids){ // NOTE: ids must be passed in as array
    d3.select("#breweryLayer") // de-select everything, ignore filters
      .selectAll("circle")
      .classed("selected", false);

    for(let i = 0; i < ids.length; i++){
      d3.select(`#br_${ids[i]}`)
        .classed("selected", true);
    }
  }
}
