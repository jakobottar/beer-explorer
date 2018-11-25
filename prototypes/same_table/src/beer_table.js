var UpdateBeerTable = function(data) {
  d3.select('#back_button')
    .html('<' + data.brewery_name)
    .on('click', function() {
      init(data);
    });

  var rows = d3
    .select('#brewery_table')
    .select('tbody')
    .selectAll('tr')
    .data(data.beers);

  console.log(rows);
  rows.exit().remove();
  rows
    .enter()
    .append('tr')
    .merge(rows)
    .on('click', function(d) {
      UpdateDetailView(d);
    });

  let td = d3
    .select('#brewery_table')
    .select('tbody')
    .selectAll('tr')
    .selectAll('td')
    .data(d => {
      return [
        // d.lat,
        // d.lng,
        { value: d.beer_name, width: 350 },
        { value: Math.round(d.averages.overall * 100) / 100, width: 100 },
        { value: Math.round(d.averages.taste * 100) / 100, width: 100 },
        { value: Math.round(d.averages.appearance * 100) / 100, width: 100 },
        { value: Math.round(d.averages.aroma * 100) / 100, width: 100 },
        { value: Math.round(d.averages.palate * 100) / 100, width: 100 },
        { value: d.n_reviews, width: 200 }
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
