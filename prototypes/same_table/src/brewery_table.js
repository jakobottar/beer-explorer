var UpdateBreweryTable = function(breweryData) {
  console.log(breweryData);
  var rows = d3
    .select('#brewery_table')
    .select('tbody')
    .selectAll('tr')
    .data(breweryData)
    .enter()
    .append('tr')
    .on('click', (d, i) => {
      UpdateBeerTable(d);
    });

  let td = rows
    .selectAll('td')
    .data(d => {
      return [
        // d.lat,
        // d.lng,
        { value: d.brewery_name, width: 350 },
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
