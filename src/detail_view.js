var UpdateDetailView = function(histogramData) {
  let dataArray = [{ x: 0, y: 0 }];
  for (let i = 0; i < histogramData.overall.length; i++) {
    dataArray.push({ x: i + 1, y: histogramData.overall[i] });
  }
  dataArray.push({ x: 5, y: 0 });

  let svg = d3.select('#summaryTable').select('svg');

  let x_margin = 25;
  let y_margin = 25;

  let svgWidth = svg.node().clientWidth - 2 * x_margin;

  let svgHeight = 250;

  const histogramScale = d3
    .scaleLinear()
    .domain([0, d3.max(histogramData.overall)])
    .range([svgHeight - 2 * y_margin, y_margin]);

  const xScale = d3
    .scaleLinear()
    .domain([0, 5])
    .range([x_margin, svgWidth - 2 * x_margin]);

  let boxWidth = xScale(2) - xScale(1);

  var y_axis = d3.axisLeft().scale(histogramScale);
  var x_axis = d3.axisBottom().scale(xScale);

  svg.selectAll('g').remove();

  svg
    .append('g')
    .attr(
      'transform',
      'translate(' + (2 * x_margin - 5) + ', ' + y_margin + ')'
    )
    .call(y_axis);

  svg
    .append('g')
    .attr(
      'transform',
      'translate(' + x_margin + ', ' + (svgHeight - y_margin) + ')'
    )
    .call(x_axis);

  var distributionLine = d3
    .line()
    .x(function(d, i) {
      return xScale(d.x) + x_margin;
    })
    .y(function(d, i) {
      return histogramScale(d.y) + y_margin;
    })
    .curve(d3.curveBundle);

  svg.select('path').remove();
  svg
    .append('path')
    .attr('d', distributionLine(dataArray))
    .attr('class', 'histogram');

  // rects
  //   .enter()
  //   .append('rect')
  //   .merge(rects)
  //   .attr('x', (d, i) => {
  //     return xScale(i) + x_margin;
  //   })
  //   .attr('y', (d, i) => {
  //     return histogramScale(d) + y_margin;
  //   })
  //   .attr('width', boxWidth)
  //   .attr('height', d => {
  //     return svgHeight - histogramScale(d) - y_margin - 3;
  //   });
};
