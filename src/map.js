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
        }
        else{d.x = -10};
        return d.x;
      })
      .attr("cy", d =>{
        let loc = this.projection([d.lng, d.lat]);
        if(loc != null){
           d.y = loc[1];
        }
        else{d.y = -10};
        return d.y;
      })
      .attr("r", "3")
      .attr("class", "filtered")
      .attr("id", d => `br_${d.brewery_id}`)
      .append("title")
      .text(d => d.brewery_name);

    map.buildLegend();

    let brush = d3.brush().on("end", brushended)
    let idleTimeout;
    let idleDelay = 350;

    this.svg.append("g")
      .attr("class", "brush")
      .call(brush);


    let projection = this.projection;
    let x = this.x;
    let y = this.y;

    function brushended() {
      let s = d3.event.selection;

      let brushed = [];

      if(s != null){
        let tr = [x.invert(s[0][0]), y.invert(s[0][1])]
        let bl = [x.invert(s[1][0]), y.invert(s[1][1])]

        for(let i = 1; i < data.length; i++){
          let dataSvgLoc = [data[i].x, data[i].y]

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
        map.updateFiltered(brushed)
        map.zoom(s)
      }
      else{
        if(idleTimeout == null) {
          return idleTimeout = setTimeout(idled, idleDelay);
        }
        else{
          map.updateFiltered(null);
          map.zoom(null);
        }
      }
    }

    function idled(){
      idleTimeout = null;
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

  buildLegend(){
    let mapLegend = this.svg.append('g')
      .attr("id", "legend")

    var xLoc = [35, 95, 155];
    var circ_class = ["unselected", "filtered", "selected"];
    var lab = ["Ignored", "Filtered", "Selected"];

    for(let i = 0; i < 3; i++){
      mapLegend.append("text")
        .attr("x", xLoc[i])
        .attr("y", this.height - 15)
        .attr("class", "legend")
        .text(lab[i]);

      mapLegend.append("circle")
        .attr("cx", xLoc[i])
        .attr("cy", this.height - 35)
        .attr("class", circ_class[i])
        // .attr("style", "stroke-width: 1.5")
        .attr("r", 5);
    }

    mapLegend.append("text")
      .attr("id", "helpText")
      .attr("class", "shown")
      .attr("font-size", "15px")
      .append("tspan")
      .attr("x", 10)
      .attr("dy", "1.2em")
      .text("Brush to zoom")

    d3.select("#helpText")
      .append("tspan")
      .attr("x", 10)
      .attr("dy", "1.2em")
      .text("Double-click to Return")
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
    let helpText = d3.select('#helpText')

    if(helpText.attr("class") == "shown"){
      helpText
        .transition()
        .duration(1200)
        .attr("class", "hidden")
    }

    let screenBox = {
      x: [0, this.width],
      y: [0, this.height],
      aspect: this.width/this.height
    };

    let scaleFactor = 1

    if(s == null){
      d3.select("#mapLayer")
        .transition()
        .duration(750)
        .attr("transform", "translate(0,0) scale(1)")

      this.x.domain([0, this.width]);
      this.y.domain([0, this.height]);
    }
    else{
      s = [[this.x.invert(s[0][0]), this.y.invert(s[0][1])], [this.x.invert(s[1][0]), this.y.invert(s[1][1])]]

      let x1 = Math.min(s[0][0], s[1][0])
      let x2 = Math.max(s[0][0], s[1][0])
      let y1 = Math.min(s[0][1], s[1][1])
      let y2 = Math.max(s[0][1], s[1][1])

      let selHeight = y2 - y1
      let selWidth = x2 - x1

      if((selWidth / selHeight) > screenBox.aspect){ // too wide
        screenBox.x[0] = x1;
        screenBox.x[1] = x2;

        screenBox.y[0] = y1 - 0.5*((selWidth/screenBox.aspect) - selHeight);
        screenBox.y[1] = y2 + 0.5*((selWidth/screenBox.aspect) - selHeight);
      }
      else if((selWidth / selHeight) < screenBox.aspect){ // too tall
        screenBox.y[0] = y1;
        screenBox.y[1] = y2;

        screenBox.x[0] = x1 - 0.5*((selHeight*screenBox.aspect) - selWidth);
        screenBox.x[1] = x2 + 0.5*((selHeight*screenBox.aspect) - selWidth);
      }

      scaleFactor = this.height / (screenBox.y[1] - screenBox.y[0])

      // d3.select('#mapLayer').append("circle")
      //   .attr("cx", s[0][0])
      //   .attr("cy", s[0][1])
      //   .attr("r", 4)
      //   .attr("fill", "red")
      //
      // d3.select('#mapLayer').append("circle")
      //   .attr("cx", s[1][0])
      //   .attr("cy", s[1][1])
      //   .attr("r", 4)
      //   .attr("fill", "blue")
      //
      // d3.select("#mapLayer").append("polygon")
      //   .attr("points", `${screenBox.x[0]},${screenBox.y[0]} ${screenBox.x[0]},${screenBox.y[1]} ${screenBox.x[1]},${screenBox.y[1]} ${screenBox.x[1]},${screenBox.y[0]}`)
      //   .attr("style", "fill:none;stroke:red;stroke-width:2");

      d3.select("#mapLayer")
        .transition()
        .duration(750)
        .attr("transform", `translate(${-screenBox.x[0]*scaleFactor}, ${-screenBox.y[0]*scaleFactor}) scale(${scaleFactor})`)

      this.x.domain([screenBox.x[0], screenBox.x[1]]);
      this.y.domain([screenBox.y[0], screenBox.y[1]]);
    }

    d3.select("#breweryLayer")
      .selectAll("circle")
      .transition()
      .duration(750)
      .attr("cx", d=>{
        if(d.x != null){
          return this.x(d.x)
        }
      })
      .attr("cy", d =>{
        if(d.y != null){
          return this.y(d.y)
        }
      })
      .attr("r", d => {
        return (s == null) ? "3" : "5" ;
      });

    let cityLayer = d3.select("#cityLayer").html("")

    console.log(scaleFactor)
    if(scaleFactor > 3){
      d3.csv("data/cities.csv", data =>{
        console.log(data);
        console.log("City Dots Added!")
        //add city dots

        if (scaleFactor > 5) {
          console.log("City Names Added!")
          // add city names
        }
      });
    }
  }
}
