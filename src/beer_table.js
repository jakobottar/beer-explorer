var UpdateBeerTable = async function(data) {
  console.log(data);

  var rows = d3
    .select('#beer_table')
    .append('tbody')
    .selectAll('tr')
    .data(data.beers)
    .enter()
    .append('tr')
    .on('click', function(d) {
      UpdateDetailView(d);
    });

  let td = rows
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
    })
    .enter()
    .append('td')
    .attr('height', 20)
    .attr('width', d => {
      return d.width;
    })
    .append('text')
    .text(d => {
      return d.value;
    });
};
