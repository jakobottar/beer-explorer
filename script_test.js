let init = async function() {
  let breweryData = await d3.json('data/processed_data.json');
  UpdateBreweryTable(breweryData);
};
