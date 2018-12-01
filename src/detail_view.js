var UpdateDetailView = function(histogramData) {
  function updateHistogram(location, histogram, attribute) {
    let dataArray = [{ x: 0, y: 0 }];
    let resetArray = [{ x: 0, y: 0 }];
    let dataAccessAttribute = attribute.toLowerCase();
    for (let i = 0; i < histogramData[dataAccessAttribute].length; i++) {
      dataArray.push({ x: i + 1, y: histogramData[dataAccessAttribute][i] });
      resetArray.push({ x: i + 1, y: 0 });
    }
    dataArray.push({ x: 5, y: 0 });
    resetArray.push({ x: 5, y: 0 });

    let svg = d3.select('#summaryTable').select('svg');

    let x_margin = 25;
    let y_margin = 25;

    let svgWidth = svg.node().clientWidth - 2 * x_margin;

    let svgHeight = 200;

    const histogramScale = d3
      .scaleLinear()
      .domain([0, d3.max(histogramData[dataAccessAttribute])])
      .range([
        svgHeight - 2 * y_margin + (location[1] - 1) * svgHeight,
        y_margin + (location[1] - 1) * svgHeight
      ]);

    let xScale = d3
      .scaleLinear()
      .domain([0, 5])
      .range([x_margin + 15, svgWidth - 2 * x_margin]);

    let histWidth = svgWidth / 2;

    if (location[1] != 1) {
      xScale = d3
        .scaleLinear()
        .domain([0, 5])
        .range([
          x_margin + (location[0] - 1) * histWidth + 15,
          histWidth + (location[0] - 1) * histWidth - 2 * x_margin
        ]);
    }

    var y_axis = d3.axisLeft().scale(histogramScale);
    var x_axis = d3.axisBottom().scale(xScale);

    svg.select('#' + dataAccessAttribute + '_yAxis').remove();
    svg.select('#' + dataAccessAttribute + '_xAxis').remove();

    svg
      .append('g')
      .attr('id', dataAccessAttribute + '_yAxis')
      .attr(
        'transform',
        'translate(' +
          ((location[0] - 1) * histWidth + 2 * x_margin + 15) +
          ', ' +
          y_margin +
          ')'
      )
      .call(y_axis.ticks(5));

    svg
      .append('g')
      .attr('id', dataAccessAttribute + '_xAxis')
      .attr(
        'transform',
        'translate(' +
          x_margin +
          ', ' +
          (svgHeight + (location[1] - 1) * svgHeight - y_margin) +
          ')'
      )
      .call(x_axis.ticks(5));

    var distributionLine = d3
      .line()
      .x(function(d, i) {
        return xScale(d.x) + x_margin;
      })
      .y(function(d, i) {
        return histogramScale(d.y) + y_margin;
      })
      .curve(d3.curveBundle);

    // svg.select('#' + dataAccessAttribute + '_path').remove();

    svg
      .select('#' + dataAccessAttribute + '_path')
      // .attr('d', distributionLine(resetArray))
      .transition()
      .duration(500)
      .attr('id', dataAccessAttribute + '_path')
      .attr('d', distributionLine(dataArray))
      .attr('class', 'histogram');

    //Update Chart X Axis Label
    svg.select('#' + dataAccessAttribute + '_xTitle').remove();
    svg
      .append('text')
      .attr('id', dataAccessAttribute + '_xTitle')
      .text('Rating')
      .attr('class', 'axis-title')
      .attr('x', () => {
        if (location[1] == 1) {
          return svgWidth / 2;
        } else {
          return histWidth / 2 + (location[0] - 1) * histWidth;
        }
      })
      .attr('y', () => {
        return svgHeight + (location[1] - 1) * svgHeight + 10;
      });

    //Update Chart Y Axis Label
    svg.select('#' + dataAccessAttribute + '_yTitle').remove();
    svg
      .append('text')
      .attr('id', dataAccessAttribute + '_yTitle')
      .text('Counts')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', () => {
        if (location[1] == 1) {
          return 13;
        } else {
          return 13 + (location[0] - 1) * histWidth;
        }
      })
      .attr('x', () => {
        return -1 * (svgHeight / 2 + (location[1] - 1) * svgHeight + 10);
      });

    //Update Chart Title
    svg.select('#' + dataAccessAttribute + '_title').remove();
    svg
      .append('text')
      .attr('id', dataAccessAttribute + '_title')
      .text(attribute)
      .attr('class', 'chart-title')
      .attr('x', () => {
        if (location[1] == 1) {
          return svgWidth / 2 + 15;
        } else {
          return histWidth / 2 + (location[0] - 1) * histWidth + 15;
        }
      })
      .attr('y', () => {
        return (location[1] - 1) * svgHeight + 50;
      });
  }

  updateHistogram([1, 1], histogramData, 'Overall');
  updateHistogram([1, 2], histogramData, 'Aroma');
  updateHistogram([2, 2], histogramData, 'Appearance');
  updateHistogram([1, 3], histogramData, 'Palate');
  updateHistogram([2, 3], histogramData, 'Taste');
};
