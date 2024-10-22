var UpdateBeerTable = function(data) {
  var rows = d3
    .select('#beer_table')
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
    .select('#beer_table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data(d => {
      return [
        { value: d.beer_name, width: 350 },
        { value: Math.round(d.averages.overall * 100) / 100, width: 100 },
        { value: d.n_reviews, width: 100 }
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
