var UpdateBeerTable = function(data) {
  console.log(data.beers);
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
      UpdateDetailView(d);
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
    .attr('width', d => d.width)
    .text(d => {
      return d.value;
    });
};
