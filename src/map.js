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

    this.x = d3.scaleLinear().domain([0, this.width]).range([0, this.width])
    this.y = d3.scaleLinear().domain([0, this.height]).range([0, this.height])
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
          d.x = loc[0];
          return loc[0]
        }
      })
      .attr("cy", d =>{
        let loc = this.projection([d.lng, d.lat]);
        if(loc != null){
          d.y = loc[1];
          return loc[1]
        }
      })
      .attr("r", "3")
      .attr("class", "filtered")
      .attr("id", d => `br_${d.brewery_id}`)
      .append("title")
      .text(d => d.brewery_name);

    let brush = d3.brush().on("end", brushended)

    this.svg.append("g")
      .attr("class", "brush")
      .call(brush);


    let projection = this.projection;

    function brushended() {
      let s = d3.event.selection;

      let brushed = [];

      if(s != null){
        let tr = s[0]
        let bl = s[1]

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

        // TODO: instead of printing to console, update brewery table
        console.log(brushed)

        d3.select(".brush").call(brush.move, null)
      }
      else{
        map.updateFiltered();
      }

      map.updateFiltered(brushed)
      map.zoom(s)
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

    if(ids == null || ids.length == 0){
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

  zoom(s){
    let screenBox = {
      x1: 0,
      x2: this.height,
      y1: 0,
      y2: this.width,
      aspect: this.width/this.height
    };

    if(s == null){
      //unzoom
    }
    else{
      console.log(s)

      let selHeight = s[1][1] - s[0][1]
      let selWidth = s[0][0] - s[1][0]

      if((selWidth / selHeight) > screenBox.aspect){ // too wide
        screenBox.x1 = s[0][0];
        screenBox.x2 = s[1][0];

        screenBox.y1 = s[0][1] + 0.5*((selWidth/screenBox.aspect) - selHeight);
        screenBox.y2 = s[1][1] - 0.5*((selWidth/screenBox.aspect) - selHeight);
      }
      if((selWidth / selHeight) < screenBox.aspect){ // too tall
        screenBox.y1 = s[0][1];
        screenBox.y2 = s[1][1];

        screenBox.x1 = s[0][0] + 0.5*((selHeight*screenBox.aspect) - selWidth);
        screenBox.x2 = s[1][0] - 0.5*((selHeight*screenBox.aspect) - selWidth);
      }

      this.svg.append("polygon")
        .attr("points", `${screenBox.x1},${screenBox.y1} ${screenBox.x1},${screenBox.y2} ${screenBox.x2},${screenBox.y2} ${screenBox.x2},${screenBox.y1}`)
        .attr("style", "fill:none;stroke:red;stroke-width:2");
    }
  }
}
