// TODO: Cosmetic Stuff

class Map {
  constructor() {
    this.svg = d3.select('#map'); // select the map svg element

    let svgbounds = this.svg.node().getBoundingClientRect(); // get it's height/width
    this.width = svgbounds.width;
    this.height = svgbounds.height;

    this.projection = d3 // map projection
      .geoAlbersUsa()
      .translate([this.width / 2, this.height / 2])
      .scale([1200]);

    this.x = d3 // x scale for brewery points
      .scaleLinear()
      .domain([0, this.width])
      .range([0, this.width]);
    this.y = d3 // y scale for brewery points
      .scaleLinear()
      .domain([0, this.height])
      .range([0, this.height]);

    this.duration = 750; // transition duration
    this.scaleFactor = 1; // keeps track of how zoomed in we are
  }

  buildMap(data) {

    // First we will append a brush, so it is behind the points we add
    // we need this because otherwise 'mouseover' events won't trigger
    let brush = d3.brush().on('end', brushended);
    let idleTimeout;
    let idleDelay = 350;

    this.svg
      .append('g')
      .attr('class', 'brush')
      .call(brush);

    // now draw the map
    let path = d3.geoPath().projection(this.projection);

    // read the geoJSON file and draw the states.
    d3.json('data/us-states.json', function(error, us) {
      if (error) throw error;

      d3.select('#mapLayer')
        .selectAll('path')
        .data(us.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'state');
    });

    // now draw the brewery dots
    this.svg
      .append('g')
      .attr('id', 'breweryLayer')
      .selectAll('circle')
      .data(data) // data contains our processed data json
      .enter()
      .append('circle')
      .attr('cx', d => {
        let loc = this.projection([d.lng, d.lat]); // project the lat/lng onto the svg
        if (loc != null) {
          d.x = loc[0]; // store the x and y values in the data element, useful for future brushing checks
        } else {
          d.x = -10;
        }
        return d.x;
      })
      .attr('cy', d => {
        let loc = this.projection([d.lng, d.lat]);
        if (loc != null) {
          d.y = loc[1];
        } else {
          d.y = -10;
        }
        return d.y;
      })
      .attr('r', '3')
      .attr('class', 'filtered')
      .attr('id', d => `br_${d.brewery_id}`)
      .on('click', d => {
        // Make this clicked brewery the "selected" brewery in the tables
        console.log(d.brewery_id);
        map.updateSelected([d.brewery_id]);
      })
      .on('mouseover', d => {
        let xPos = d3.mouse(d3.select('body').node())[0] + 15;
        let yPos = d3.mouse(d3.select('body').node())[1] + 15;

        d3.select('#tooltip')
          .style('left', xPos + 'px')
          .style('top', yPos + 'px')
          .select('#val')
          .text(d.brewery_name);

        if (this.scaleFactor > 2) {
          d3.select('#tooltip').classed('hidden', false);
        }
      })
      .on('mouseout', d => {
        d3.select('#tooltip').classed('hidden', true);
      });

    let cityLayer = d3.select('#cityLayer');

    d3.csv('data/cities.csv', d => {
      cityLayer
        .selectAll('circle')
        .data(d)
        .enter()
        .append('circle')
        .classed('city', true)
        .style('opacity', 0)
        .attr('cx', d => {
          let loc = this.projection([d.lng, d.lat]);
          if (loc != null) {
            d.x = loc[0];
            return d.x;
          }
        })
        .attr('cy', d => {
          let loc = this.projection([d.lng, d.lat]);
          if (loc != null) {
            d.y = loc[1];
            return d.y;
          }
        })
        .attr('r', '3');

      cityLayer
        .selectAll('text')
        .data(d)
        .enter()
        .append('text')
        .classed('city', true)
        .style('opacity', 0)
        .attr('x', d => d.x + 7)
        .attr('y', d => d.y + 6)
        .text(d => d.city);
    });

    map.buildLegend();

    let projection = this.projection;
    let x = this.x;
    let y = this.y;

    function brushended() {
      let s = d3.event.selection;

      let brushed = [];

      if (s != null) {
        let tr = [x.invert(s[0][0]), y.invert(s[0][1])];
        let bl = [x.invert(s[1][0]), y.invert(s[1][1])];

        for (let i = 1; i < data.length; i++) {
          let dataSvgLoc = [data[i].x, data[i].y];

          if (dataSvgLoc != null) {
            if (dataSvgLoc[1] >= tr[1] && dataSvgLoc[1] <= bl[1]) {
              if (dataSvgLoc[0] >= tr[0] && dataSvgLoc[0] <= bl[0]) {
                brushed.push(data[i]);
              }
            }
          }
        }

        // TODO: instead of printing to console, update brewery table

        console.log(brushed);
        UpdateBreweryTable(brushed);
        updateSummaryTableTitle('Summary of Filtered Breweries');

        d3.select('.brush').call(brush.move, null);
        map.updateFiltered(brushed.map(el => el.brewery_id));
        map.zoom(s);
      } else {
        if (idleTimeout == null) {
          return (idleTimeout = setTimeout(idled, idleDelay));
        } else {
          map.updateFiltered(null);
          map.zoom(null);
          UpdateBreweryTable(data);
          updateSummaryTableTitle('Summary of all Breweries');
        }
      }
    }

    function idled() {
      idleTimeout = null;
    }
  }

  buildLegend() {
    let mapLegend = this.svg.append('g').attr('id', 'legend');

    var xLoc = [35, 95, 155];
    var circ_class = ['unselected', 'filtered', 'selected'];
    var lab = ['Ignored', 'Filtered', 'Selected'];

    for (let i = 0; i < 3; i++) {
      mapLegend
        .append('text')
        .attr('x', xLoc[i])
        .attr('y', this.height - 15)
        .attr('class', 'legend')
        .text(lab[i]);

      mapLegend
        .append('circle')
        .attr('cx', xLoc[i])
        .attr('cy', this.height - 35)
        .attr('class', circ_class[i])
        // .attr("style", "stroke-width: 1.5")
        .attr('r', 5);
    }

    mapLegend
      .append('text')
      .attr('id', 'helpText')
      .attr('class', 'legend')
      .attr('x', 10)
      .attr('dy', '1.2em')
      .text('Drag to zoom');
  }

  // Clears currently filtered items and colors passed-in ids
  // ids must be passed in as array
  // if array is null, clear filters and return to starting scenario
  updateFiltered(ids) {
    d3.select('#breweryLayer') // de-filter everything
      .selectAll('circle')
      .classed('filtered', false)
      .classed('unselected', true)
      .classed('selected', false);

    if (ids == null || ids.length == 0) {
      d3.select('#breweryLayer') // filter everything, on clear
        .selectAll('circle')
        .classed('filtered', true)
        .classed('unselected', false);

      return;
    }

    for (let i = 0; i < ids.length; i++) {
      d3.select(`#br_${ids[i]}`)
        .classed('filtered', true)
        .classed('unselected', false);
    }
  }

  // Clears currently selected items and colors passed-in ids
  // ids must be passed in as array
  // if array is null, clear selection and return to starting scenario
  updateSelected(ids) {
    d3.select('#breweryLayer') // de-select everything, ignore filters
      .selectAll('circle')
      .classed('selected', false);

    if (ids == null) {
      return;
    } // don't select anything new, on clear

    for (let i = 0; i < ids.length; i++) {
      d3.select(`#br_${ids[i]}`)
        // .classed("unselected", false)
        .classed('selected', true);
    }
  }

  zoom(s) {
    let helpText = d3.select('#helpText');

    let screenBox = {
      x: [0, this.width],
      y: [0, this.height],
      aspect: this.width / this.height
    };

    this.scaleFactor = 1;

    let cityLayer = d3.select('#cityLayer');

    if (s == null) {
      d3.select('#mapLayer')
        .transition()
        .duration(this.duration)
        .attr('transform', 'translate(0,0) scale(1)');

      this.x.domain([0, this.width]);
      this.y.domain([0, this.height]);

      helpText.text('Drag to zoom');

      cityLayer
        .selectAll('circle')
        .transition()
        .duration(this.duration)
        .style('opacity', 0)
        .attr('cx', d => {
          if (d.x != null) {
            return this.x(d.x);
          }
        })
        .attr('cy', d => {
          if (d.y != null) {
            return this.y(d.y);
          }
        });

      cityLayer
        .selectAll('text')
        .transition()
        .duration(this.duration)
        .style('opacity', 0)
        .attr('x', d => this.x(d.x) + 7)
        .attr('y', d => this.y(d.y) + 6);
    } else {
      s = [
        [this.x.invert(s[0][0]), this.y.invert(s[0][1])],
        [this.x.invert(s[1][0]), this.y.invert(s[1][1])]
      ];

      let x1 = Math.min(s[0][0], s[1][0]);
      let x2 = Math.max(s[0][0], s[1][0]);
      let y1 = Math.min(s[0][1], s[1][1]);
      let y2 = Math.max(s[0][1], s[1][1]);

      let selHeight = y2 - y1;
      let selWidth = x2 - x1;

      if (selWidth / selHeight > screenBox.aspect) {
        // too wide
        screenBox.x[0] = x1;
        screenBox.x[1] = x2;

        screenBox.y[0] = y1 - 0.5 * (selWidth / screenBox.aspect - selHeight);
        screenBox.y[1] = y2 + 0.5 * (selWidth / screenBox.aspect - selHeight);
      } else if (selWidth / selHeight < screenBox.aspect) {
        // too tall
        screenBox.y[0] = y1;
        screenBox.y[1] = y2;

        screenBox.x[0] = x1 - 0.5 * (selHeight * screenBox.aspect - selWidth);
        screenBox.x[1] = x2 + 0.5 * (selHeight * screenBox.aspect - selWidth);
      }

      this.scaleFactor = this.height / (screenBox.y[1] - screenBox.y[0]);

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

      d3.select('#mapLayer')
        .transition()
        .duration(this.duration)
        .attr(
          'transform',
          `translate(${-screenBox.x[0] * this.scaleFactor}, ${-screenBox.y[0] *
            this.scaleFactor}) scale(${this.scaleFactor})`
        );

      this.x.domain([screenBox.x[0], screenBox.x[1]]);
      this.y.domain([screenBox.y[0], screenBox.y[1]]);

      helpText.text('Double-Click to return');
    }

    d3.select('#breweryLayer')
      .selectAll('circle')
      .transition()
      .duration(this.duration)
      .attr('cx', d => {
        if (d.x != null) {
          return this.x(d.x);
        }
      })
      .attr('cy', d => {
        if (d.y != null) {
          return this.y(d.y);
        }
      })
      .attr('r', d => {
        return s == null ? '3' : '5';
      });

    cityLayer
      .selectAll('circle')
      .transition()
      .duration(this.duration)
      .style('opacity', d => {
        if (this.scaleFactor > 2) {
          return 1;
        }
        return 0;
      })
      .attr('cx', d => this.x(d.x))
      .attr('cy', d => this.y(d.y));

    cityLayer
      .selectAll('text')
      .transition()
      .duration(this.duration)
      .style('opacity', d => {
        if (this.scaleFactor > 4) {
          return 1;
        }
        return 0;
      })
      .attr('x', d => this.x(d.x) + 7)
      .attr('y', d => this.y(d.y) + 4.5);
  }
}
