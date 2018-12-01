var UpdateBreweryTable = function(breweryData) {
  UpdateDetailView(aggregateHistogramData(breweryData));
  removeTable();

  var rows = d3
    .select('#breweryTable')
    .select('table')
    .select('tbody')
    .selectAll('tr')
    .data(breweryData);

  rows.exit().remove();

  var newRows = rows
    .enter()
    .append('tr')
    .on('click', (d, i) => {
      newTable();
      UpdateBeerTable(d);
      map.updateSelected([d.brewery_id]);
    });

  let td = newRows
    .merge(rows)
    .selectAll('td')
    .data(d => {
      return [
        { value: d.brewery_name, width: '60%' },
        { value: Math.round(d.averages.overall * 100) / 100, width: '20%' },
        { value: d.beers.length, width: '20%' }
      ];
    });

  td.enter()
    .append('td')
    .append('text')
    .merge(td)
    .attr('width', d => d.width)
    .text(d => {
      return d.value;
    });
};
