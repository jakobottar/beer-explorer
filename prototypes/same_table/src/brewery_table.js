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
        { value: d.brewery_name, width: 350 },
        { value: Math.round(d.averages.overall * 100) / 100, width: 100 },
        { value: d.beers.length, width: 100 }
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
