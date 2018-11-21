var BuildTable = function(breweryData) {
  console.log(breweryData);
  var rows = d3
    .select('#brewery_table')
    .append('tbody')
    .selectAll('tr')
    .data(breweryData)
    .enter()
    .append('tr')
    .on('click', (d, i) => {
      BuildBeerTable(d);
    });

  let td = rows
    .selectAll('td')
    .data(d => {
      return [
        // d.lat,
        // d.lng,
        { value: d.brewery_name, width: 350 },
        { value: Math.round(d.mean_overall * 100) / 100, width: 100 },
        { value: Math.round(d.mean_taste * 100) / 100, width: 100 },
        { value: Math.round(d.mean_appearance * 100) / 100, width: 100 },
        { value: Math.round(d.mean_aroma * 100) / 100, width: 100 },
        { value: Math.round(d.mean_palate * 100) / 100, width: 100 },
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

BuildBeerTable = async function(data) {
  console.log(data);
  console.log(data.brewery_id);
  let rawBeerData = await d3.csv('data/breweries/' + data.brewery_id + '.csv');
  let processedBeerData = ProcessBeerData(rawBeerData);
  console.log(processedBeerData);

  var rows = d3
    .select('#beer_table')
    .append('tbody')
    .selectAll('tr')
    .data(processedBeerData)
    .enter()
    .append('tr');

  let td = rows
    .selectAll('td')
    .data(d => {
      return [
        // d.lat,
        // d.lng,
        { value: d.beer_name, width: 350 },
        { value: Math.round(d.review_overall * 100) / 100, width: 100 },
        { value: Math.round(d.review_taste * 100) / 100, width: 100 },
        { value: Math.round(d.review_appearance * 100) / 100, width: 100 },
        { value: Math.round(d.review_aroma * 100) / 100, width: 100 },
        { value: Math.round(d.review_palate * 100) / 100, width: 100 },
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

var ProcessBeerData = function(beerData) {
  beerData = beerData.reduce(function(acc, el) {
    if (typeof acc[el.beer_beerid] == 'undefined') {
      acc[el.beer_beerid] = [el];
    } else {
      acc[el.beer_beerid].push(el);
    }
    return acc;
  }, {});

  let finalData = [];
  for (let beer in beerData) {
    finalData.push(
      beerData[beer]
        .map(function(el) {
          el.review_appearance = parseFloat(el.review_appearance);
          el.review_aroma = parseFloat(el.review_aroma);
          el.review_overall = parseFloat(el.review_overall);
          el.review_palate = parseFloat(el.review_palate);
          el.review_taste = parseFloat(el.review_taste);
          return el;
        })
        .reduce(function(acc, el) {
          if (acc == null) {
            el.n_reviews = 1;
            return el;
          } else {
            acc.review_appearance += el.review_appearance;
            acc.review_aroma += el.review_aroma;
            acc.review_overall += el.review_overall;
            acc.review_palate += el.review_palate;
            acc.review_taste += el.review_taste;
            acc.n_reviews++;
            return acc;
          }
        }, null)
    );
  }

  finalData.map(function(el) {
    el.review_appearance = el.review_appearance / el.n_reviews;
    el.review_aroma = el.review_aroma / el.n_reviews;
    el.review_overall = el.review_overall / el.n_reviews;
    el.review_palate = el.review_palate / el.n_reviews;
    el.review_taste = el.review_taste / el.n_reviews;
    return el;
  });
  return finalData;
};
