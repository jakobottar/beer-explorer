var UpdateBeerTable = function(data) {
  console.log('BEERRRR STUFF: ', data);
  newTable();
  UpdateDetailView(aggregateHistogramData(data.beers));
  updateSummaryTableTitle('Summary of ' + data.brewery_name + ' Beers');
  var rows = d3
    .select('#beerTable')
    .select('table')
    .select('tbody')
    .selectAll('tr')
    .data(data.beers);

  rows.exit().remove();
  rows
    .enter()
    .append('tr')
    .merge(rows)
    .on('click', function(d) {
      UpdateDetailView(d.histogram);
      updateSummaryTableTitle('Summary of ' + d.beer_name);
    });

  let td = d3
    .select('#beerTable')
    .select('table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data(d => {
      return [
        { value: d.beer_name, width: '60%' },
        { value: Math.round(d.averages.overall * 100) / 100, width: '20%' },
        { value: d.n_reviews, width: '20%' }
      ];
    });

  td.enter()
    .append('td')
    .append('text')
    .merge(td)
    .text(d => {
      return d.value;
    });
};
