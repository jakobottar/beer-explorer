var UpdateSelectedBreweryColors = function(breweryId) {
  d3.select('#breweryTable')
    .selectAll('tr')
    .classed('selected', false);
  if (typeof breweryId != 'undefined') {
    d3.select('#breweryTable')
      .select('#id_' + breweryId)
      .classed('selected', true);
  }
};

var UpdateBreweryTable = function(breweryData) {
  showBeerTableStatus();
  UpdateDetailView(aggregateHistogramData(breweryData));

  UpdateSelectedBreweryColors();

  d3.select('#breweryNameUp').on('click', () => {
    breweryData.sort(function(a, b) {
      var textA = a.brewery_name.toUpperCase();
      var textB = b.brewery_name.toUpperCase();
      return textA < textB ? -1 : textA > textB ? 1 : 0;
    });
    UpdateBreweryTable(breweryData);
  });

  d3.select('#breweryNameDown').on('click', () => {
    breweryData.sort(function(a, b) {
      var textA = a.brewery_name.toUpperCase();
      var textB = b.brewery_name.toUpperCase();
      return textA < textB ? 1 : textA > textB ? -1 : 0;
    });
    UpdateBreweryTable(breweryData);
  });

  d3.select('#breweryOverallUp').on('click', () => {
    breweryData.sort(function(a, b) {
      return b.averages.overall - a.averages.overall;
    });
    UpdateBreweryTable(breweryData);
  });

  d3.select('#breweryOverallDown').on('click', () => {
    breweryData.sort(function(a, b) {
      return a.averages.overall - b.averages.overall;
    });
    UpdateBreweryTable(breweryData);
  });

  d3.select('#breweryBeersUp').on('click', () => {
    breweryData.sort(function(a, b) {
      return b.beers.length - a.beers.length;
    });
    UpdateBreweryTable(breweryData);
  });

  d3.select('#breweryBeersDown').on('click', () => {
    breweryData.sort(function(a, b) {
      return a.beers.length - b.beers.length;
    });
    UpdateBreweryTable(breweryData);
  });

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
    .merge(rows)
    .attr('id', d => {
      return 'id_' + d.brewery_id;
    })
    .on('click', (d, i) => {
      UpdateBeerTable(d);
      map.updateSelected([d]);
      UpdateSelectedBreweryColors(d.brewery_id);
      hideBeerTableStatus();
    });

  let td = newRows
    .merge(rows)
    .selectAll('td')
    .data(d => {
      return [
        { value: d.brewery_name, width: '40%', class: 'table-name-column' },
        {
          value: Math.round(d.averages.overall * 100) / 100,
          width: '30%',
          class: 'table-element'
        },
        { value: d.beers.length, width: '30%', class: 'table-element' }
      ];
    });

  td.enter()
    .append('td')
    .merge(td)
    .attr('class', d => {
      return d.class;
    })
    .attr('width', d => d.width)
    .text(d => {
      return d.value;
    });
};
