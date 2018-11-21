let init = async function() {
  let breweryData = await d3.csv('data/byBrewery-Locations.csv');

  breweryData = breweryData.filter(function(el) {
    return el.lat != 'NA' && el.lng != 'NA';
  });

  BuildTable(breweryData);
};
