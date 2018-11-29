// TODO: Zooming.
// TODO: Cosmetic Stuff

class Map {

  constructor(){
    this.svg = d3.select("#map")

    let mapcontainer = d3.select('#map-container')
    let svgbounds = mapcontainer.node().getBoundingClientRect();

    this.svg
      .attr("width", svgbounds.width - 50)
      .attr("height", svgbounds.height - 50);

    this.width = svgbounds.width - 50;
    this.height = svgbounds.height - 50;

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

    let brush = d3.brush().on("end", brushended),
      idleTimeout,
      idleDelay = 350;

    this.svg.append("g")
      .attr("class", "brush")
      .call(brush);


    let projection = this.projection;

    function brushended() {
      let s = d3.event.selection;

      if(s != null){
        let tr = s[0]
        let bl = s[1]

        let brushed = [];

        for(let i = 1; i < data.length; i++){
          let dataSvgLoc = projection([data[i].lng, data[i].lat])

          if(dataSvgLoc != null){
            if(dataSvgLoc[1] >= tr[1] && dataSvgLoc[1] <= bl[1]){
              if(dataSvgLoc[0] >= tr[0] && dataSvgLoc[0] <= bl[0]){
                brushed.push(data[i].brewery_id);
              }
            }
          }
        }

        map.updateFiltered(brushed)

        // TODO: instead of printing to console, update brewery table
        console.log(brushed)
      }
      else{
        map.updateFiltered();
      }
    }
  }

  // Clears currently filtered items and colors passed-in ids
  // ids must be passed in as array
  // if array is null, clear filters and return to starting scenario
  updateFiltered(ids){
    d3.select("#breweryLayer") // de-filter everything
      .selectAll("circle")
      .classed("filtered", false)
      .classed("unselected", true);

    if(ids == null){
      d3.select("#breweryLayer") // filter everything, on clear
        .selectAll("circle")
        .classed("filtered", true)
        .classed("unselected", false);

      return;
    }

    for(let i = 0; i < ids.length; i++){
      d3.select(`#br_${ids[i]}`)
        .classed("filtered", true)
        .classed("unselected", false);
    }
  }

  // Clears currently selected items and colors passed-in ids
  // ids must be passed in as array
  // if array is null, clear selection and return to starting scenario
  updateSelected(ids){
    d3.select("#breweryLayer") // de-select everything, ignore filters
      .selectAll("circle")
      .classed("selected", false);

    if(ids == null){return; } // don't select anything new, on clear

    for(let i = 0; i < ids.length; i++){
      d3.select(`#br_${ids[i]}`)
        .classed("selected", true);
    }
  }
}
