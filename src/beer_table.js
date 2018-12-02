var UpdateSelectedBeerColors = function(beerId) {
  d3.select('#beerTable')
    .selectAll('tr')
    .classed('selected', false);
  if (typeof beerId != 'undefined') {
    d3.select('#beerTable')
      .select('#id_' + beerId)
      .classed('selected', true);
  }
};

var UpdateBeerTable = function(data) {
  console.log('BEERRRR STUFF: ', data);
  newTable();
  UpdateDetailView(aggregateHistogramData(data.beers));
  updateSummaryTableTitle('Summary of ' + data.brewery_name + ' Beers');
  UpdateSelectedBeerColors();

  d3.select('#beerNameUp').on('click', () => {
    data.beers.sort(function(a, b) {
      var textA = a.beer_name.toUpperCase();
      var textB = b.beer_name.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    UpdateBeerTable(data);
  });

  d3.select('#beerNameDown').on('click', () => {
    data.beers.sort(function(a, b) {
      var textA = a.beer_name.toUpperCase();
      var textB = b.beer_name.toUpperCase();
      return textA < textB ? 1 : textA > textB ? -1 : 0;
    });
    UpdateBeerTable(data);
  });

  d3.select('#beerOverallUp').on('click', () => {
    data.beers.sort(function(a, b) {
      return b.averages.overall - a.averages.overall;
    });
    UpdateBeerTable(data);
  });

  d3.select('#beerOverallDown').on('click', () => {
    data.beers.sort(function(a, b) {
      return a.averages.overall - b.averages.overall;
    });
    UpdateBeerTable(data);
  });

  d3.select('#beerRatingUp').on('click', () => {
    data.beers.sort(function(a, b) {
      return b.n_reviews - a.n_reviews;
    });
    UpdateBeerTable(data);
  });

  d3.select('#beerRatingDown').on('click', () => {
    data.beers.sort(function(a, b) {
      return a.n_reviews - b.n_reviews;
    });
    UpdateBeerTable(data);
  });

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
    .attr('id', d => {
      return 'id_' + d.beer_id;
    })
    .on('click', function(d) {
      UpdateDetailView(d.histogram);
      updateSummaryTableTitle('Summary of ' + d.beer_name);
      UpdateSelectedBeerColors(d.beer_id);
    });

  let td = d3
    .select('#beerTable')
    .select('table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data(d => {
      return [
        { value: d.beer_name, width: '40%', class: 'table-name-column' },
        {
          value: Math.round(d.averages.overall * 100) / 100,
          width: '30%',
          class: 'table-element'
        },
        { value: d.n_reviews, width: '30%', class: 'table-element' }
      ];
    });

  td.enter()
    .append('td')
    .merge(td)
    .attr('class', d => {
      return d.class;
    })
    .text(d => {
      return d.value;
    });
};
