let map = new Map();
globaldata = [];
function init() {
  d3.json('data/processed_data.json', data => {
    // load the process data
    globalData = data;
    map.buildMap(data); //build the map
    UpdateBreweryTable(data); // build the tables
  });
}

function updateSummaryTableTitle(value) {
  console.log(value);
  document.getElementById('summaryTableTitle').innerHTML = value;
}

function aggregateHistogramData(data) {
  return data.reduce(function(acc, el) {
    if (typeof acc.overall == 'undefined') {
      acc.overall = el.histogram.overall.slice();
      acc.aroma = el.histogram.aroma.slice();
      acc.appearance = el.histogram.appearance.slice();
      acc.palate = el.histogram.palate.slice();
      acc.taste = el.histogram.taste.slice();
    } else {
      for (let i = 0; i < el.histogram.overall.length; i++) {
        acc.overall[i] += el.histogram.overall[i];
        acc.aroma[i] += el.histogram.aroma[i];
        acc.appearance[i] += el.histogram.appearance[i];
        acc.palate[i] += el.histogram.palate[i];
        acc.taste[i] += el.histogram.taste[i];
      }
    }
    return acc;
  }, {});
}

function showBeerTableStatus() {
  document.getElementById('beer-table-status').className = 'shown';
  document.getElementById('beer-table-body').className = 'hiddenTable';
}

function hideBeerTableStatus() {
  document.getElementById('beer-table-status').className = 'hidden';
  document.getElementById('beer-table-body').className = 'shownTable';
}

function newTable() {
  // add the center beer table
  if (document.getElementById('beerTable').getAttribute('class') == 'hidden') {
    // if the beer table is hidden,
    // add the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas =
      "'map map map' 'beer1 beer2 beer3'"; // adjust the areas to account for the new table

    document.getElementById('beerTable').className = 'shown'; // show the new table
  }
}

function removeTable() {
  // remove the center beer table
  if (document.getElementById('beerTable').getAttribute('class') == 'shown') {
    // if the beer table is shown,
    // remove the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas =
      "'map map' 'beer1 beer3'"; // adjust the areas to remove the beer table

    document.getElementById('beerTable').className = 'hidden'; // hide the beer table
  }
}

function filterTable() {
  UpdateBreweryTable(globalData.slice(0, 15));
}
