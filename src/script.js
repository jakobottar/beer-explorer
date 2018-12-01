let map = new Map();
globaldata = [];
function init() {
  d3.json('data/processed_data.json', data => {
    globalData = data;
    map.buildMap(data);
    UpdateBreweryTable(data);
  });
}

function newTable() {
  if (document.getElementById('beerTable').getAttribute('class') == 'hidden') {
    // add the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas = "'map map map' 'beer1 beer2 beer3'";

    document.getElementById('beerTable').className = 'shown';
  }
}

function removeTable() {
  if (document.getElementById('beerTable').getAttribute('class') == 'shown') {
    // remove the third column
    document.getElementById('panes').style.gridTemplateColumns = '1fr 1fr';
    document.getElementById('panes').style.gridTemplateAreas = "'map map' 'beer1 beer3'";
    
    document.getElementById('beerTable').className = 'hidden';
  }
}

function filterTable() {
  UpdateBreweryTable(globalData.slice(0, 15));
}
