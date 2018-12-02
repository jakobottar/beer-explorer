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
        // When the user clicks on a brewery dot, select it in the tables below
        console.log(d.brewery_id);
        map.updateSelected([d]);
      })
      .on('mouseover', d => {
        // when a user mouses over a brewery dot, show a tooltip with the name of the brewery

        //get the mouse location
        let xPos = d3.mouse(d3.select('body').node())[0] + 15;
        let yPos = d3.mouse(d3.select('body').node())[1] + 15;

        d3.select('#tooltip') // update the tooltip div element
          .style('left', xPos + 'px')
          .style('top', yPos + 'px')
          .select('#val')
          .text(d.brewery_name);

        if (this.scaleFactor > 2) {
          // unhide if the map is zoomed in enough. We do this to keep the unzoomed map clean
          d3.select('#tooltip').classed('hidden', false);
        }
      })
      .on('mouseout', d => {
        //hide the tooltip when the user mouses away
        d3.select('#tooltip').classed('hidden', true);
      });

    // read in and add cities for geographical context
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
          // same as breweries, project to map and store x/y coords
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

      //Add the cities name next to the dot
      cityLayer
        .selectAll('text')
        .data(d)
        .enter()
        .append('text')
        .classed('city', true)
        .style('opacity', 0) // we use opacity to create a fade-in effect
        .attr('x', d => d.x + 7)
        .attr('y', d => d.y + 6)
        .text(d => d.city);
    });

    map.buildLegend(); // create the map's legend elements

    //store these variables for use in the brushendedfunction
    let projection = this.projection;
    let x = this.x;
    let y = this.y;

    function brushended() {
      // this function is called when the user brushes over the map
      let s = d3.event.selection; // get the selected area

      let brushed = []; // create an empty array to hold brushed-over breweries

      if (s != null) {
        // if the user brushes an area,
        // get the UNZOOMED position of the brushed area
        // we need to do this so that we can re-zoom while we are already zoomed in and properly check if a brewery has been brushed over
        let tr = [x.invert(s[0][0]), y.invert(s[0][1])];
        let bl = [x.invert(s[1][0]), y.invert(s[1][1])];

        for (let i = 0; i < data.length; i++) {
          // loop over all the breweries
          let dataSvgLoc = [data[i].x, data[i].y]; // get it's location

          if (dataSvgLoc != null) {
            // if it's not null (null = outside USA, not in projection)
            if (dataSvgLoc[1] >= tr[1] && dataSvgLoc[1] <= bl[1]) {
              if (dataSvgLoc[0] >= tr[0] && dataSvgLoc[0] <= bl[0]) {
                brushed.push(data[i]); // if the brewery is inside the brushed area, add it to the brushed array
              }
            }
          }
        }

        UpdateBreweryTable(brushed); // update the table with the brushed breweries
        updateSummaryTableTitle('Summary of Filtered Breweries');

        d3.select('.brush').call(brush.move, null); // clear the brush element
        map.updateFiltered(brushed.map(el => el.brewery_id)); // update the filtered brewery dots
        map.zoom(s); // zoom the map on the brushed area
      } else {
        // if the user did not brush an area (but clicked)
        if (idleTimeout == null) {
          // start a timer on first click
          return (idleTimeout = setTimeout(idled, idleDelay));
        } else {
          // if the timer is still counting down on second click, unzoom the map
          map.updateFiltered(null); // unfilter everything
          map.zoom(null); // unzoom
          UpdateBreweryTable(data); // update the table with every brewery
          updateSummaryTableTitle('Summary of all Breweries');
        }
      }
    }

    function idled() {
      // function that runs at end of timeout
      idleTimeout = null;
    }
  }

  buildLegend() {
    // build the legend elements
    let mapLegend = this.svg.append('g').attr('id', 'legend');
    // append a legend group that won't zoom

    var xLoc = [35, 95, 155]; // x locations for legend text
    var circ_class = ['unselected', 'filtered', 'selected']; // classes for legend dots
    var lab = ['Ignored', 'Filtered', 'Selected']; // legend text

    for (let i = 0; i < 3; i++) {
      // add the legend items
      mapLegend // add the text
        .append('text')
        .attr('x', xLoc[i])
        .attr('y', this.height - 15)
        .attr('class', 'legend')
        .text(lab[i]);

      mapLegend // add and class the dots
        .append('circle')
        .attr('cx', xLoc[i])
        .attr('cy', this.height - 35)
        .attr('class', circ_class[i])
        .attr("style", "stroke-width: 1; r: 5")
    }

    mapLegend // add some help text, to instruct the user
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
      .classed('unselected', true) // unselect everything
      .classed('selected', false);

    if (ids == null || ids.length == 0) {
      // if we don't pass anything in, clear filtered items
      d3.select('#breweryLayer')
        .selectAll('circle')
        .classed('filtered', true) // set everything to 'filtered'
        .classed('unselected', false);

      return; // and exit
    }

    for (let i = 0; i < ids.length; i++) {
      d3.select(`#br_${ids[i]}`) // find the appropriate brewery dot
        .classed('filtered', true) // and set it to filtered
        .classed('unselected', false);
    }
  }

  // Clears currently selected items and colors passed-in ids
  // ids must be passed in as array
  // if array is null, clear selection and return to starting scenario
  updateSelected(breweries) {
    d3.select('#breweryLayer') // de-select everything, ignore filters
      .selectAll('circle')
      .classed('selected', false);

    if (breweries == null) {
      return;
    } // don't select anything new, on clear

    for (let i = 0; i < breweries.length; i++) {
      d3.select(`#br_${breweries[i].brewery_id}`).classed('selected', true); // select the passed in breweries
    }
    UpdateBeerTable(breweries[0]);
    UpdateSelectedBreweryColors(breweries[0].brewery_id);

    console.log(breweries);
  }

  zoom(s) {
    // zoom function, zooms on selected area
    let helpText = d3.select('#helpText'); // store helptext element

    let screenBox = {
      // build a object to hold the edges of the "screen", or svg box.
      x: [0, this.width],
      y: [0, this.height],
      aspect: this.width / this.height
    };

    this.scaleFactor = 1; // clear the zoom scale

    let cityLayer = d3.select('#cityLayer'); // store the city layer element

    if (s == null) {
      // if we pass 'null' in, unzoom.
      d3.select('#mapLayer')
        .transition()
        .duration(this.duration)
        .attr('transform', 'translate(0,0) scale(1)'); // return to default svg translation

      // clear the x/y scales
      this.x.domain([0, this.width]);
      this.y.domain([0, this.height]);

      helpText.text('Drag to zoom'); // change the help text

      // update the city dot and text locations, return to default
      cityLayer
        .selectAll('circle')
        .transition()
        .duration(this.duration)
        .style('opacity', 0) // hide the dot. With the transition, this creates a fade-out effect
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
      // if we need to zoom,
      // get an unzoomed selection box
      s = [
        [this.x.invert(s[0][0]), this.y.invert(s[0][1])],
        [this.x.invert(s[1][0]), this.y.invert(s[1][1])]
      ];

      //calculate the corners
      let x1 = Math.min(s[0][0], s[1][0]);
      let x2 = Math.max(s[0][0], s[1][0]);
      let y1 = Math.min(s[0][1], s[1][1]);
      let y2 = Math.max(s[0][1], s[1][1]);

      let selHeight = y2 - y1; // store the height/width
      let selWidth = x2 - x1;

      // in order to not distort the map, we need to zoom in on an area the same aspect ratio as the default view
      // the next code computes this new "screenbox" to zoom in on
      if (selWidth / selHeight > screenBox.aspect) {
        // if the selection was too wide, we can use the x coords but need to calculate new y ones
        screenBox.x[0] = x1;
        screenBox.x[1] = x2;

        screenBox.y[0] = y1 - 0.5 * (selWidth / screenBox.aspect - selHeight);
        screenBox.y[1] = y2 + 0.5 * (selWidth / screenBox.aspect - selHeight);
      } else if (selWidth / selHeight < screenBox.aspect) {
        // if the selection was too tall, we can use the y coords but need to calculate new x ones
        screenBox.y[0] = y1;
        screenBox.y[1] = y2;

        screenBox.x[0] = x1 - 0.5 * (selHeight * screenBox.aspect - selWidth);
        screenBox.x[1] = x2 + 0.5 * (selHeight * screenBox.aspect - selWidth);
      }

      this.scaleFactor = this.height / (screenBox.y[1] - screenBox.y[0]); // calculate the scaling factor

      d3.select('#mapLayer')
        .transition()
        .duration(this.duration)
        .attr(
          'transform',
          `translate(${-screenBox.x[0] * this.scaleFactor}, ${-screenBox.y[0] *
            this.scaleFactor}) scale(${this.scaleFactor})`
        ); // The most efficent way of zooming a map is to use the svg's translate and scale elements. This means we don't need to re-project the map each time we zoom.

      this.x.domain([screenBox.x[0], screenBox.x[1]]); // set the x scale domain
      this.y.domain([screenBox.y[0], screenBox.y[1]]); // set the y scale domain

      helpText.text('Double-Click to return'); // update the help text
    }

    //This code uses the above-created elements to zoom the brewery dots
    // if we change the x/y values instead of zooming with the svg attributes, we can control the size of the dots better
    d3.select('#breweryLayer')
      .selectAll('circle')
      .transition()
      .duration(this.duration)
      .attr('cx', d => {
        if (d.x != null) {
          return this.x(d.x); // move to the new x coordinate
        }
      })
      .attr('cy', d => {
        if (d.y != null) {
          return this.y(d.y); // move to the new y coordinate
        }
      })
      .attr('r', d => {
        return s == null ? '3' : '5'; // if we've zoomed, make the circle bigger
      });

    cityLayer
      .selectAll('circle')
      .transition()
      .duration(this.duration)
      .style('opacity', d => {
        if (this.scaleFactor > 2) {
          // if we've zoomed in 2x, show the city dots
          return 1;
        }
        return 0;
      })
      .attr('cx', d => this.x(d.x)) // update the dot location
      .attr('cy', d => this.y(d.y));

    cityLayer
      .selectAll('text')
      .transition()
      .duration(this.duration)
      .style('opacity', d => {
        if (this.scaleFactor > 4) {
          // if we've zoomed in 4x, show the city names
          return 1;
        }
        return 0;
      })
      .attr('x', d => this.x(d.x) + 7) // update the text location
      .attr('y', d => this.y(d.y) + 4.5);
  }
}
