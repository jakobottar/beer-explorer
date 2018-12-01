let map = new Map();
globaldata = [];
function init() {
  d3.json('data/processed_data.json', data => {
    globalData = data;
    map.buildMap(data);
    UpdateBreweryTable(data);
  });
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

function newTable() {
  if (document.getElementById('beerTable').getAttribute('class') == 'hidden') {
    // add the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas =
      "'map map map' 'beer1 beer2 beer3'";

    document.getElementById('beerTable').className = 'shown';
  }
}

function removeTable() {
  if (document.getElementById('beerTable').getAttribute('class') == 'shown') {
    // remove the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas =
      "'map map' 'beer1 beer3'";

    document.getElementById('beerTable').className = 'hidden';
  }
}

function filterTable() {
  UpdateBreweryTable(globalData.slice(0, 15));
}
