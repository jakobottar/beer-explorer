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
    document.getElementById('panes').style.gridTemplateColumns = '33% 33% 33%';

    //resize the map
    document.getElementById('map-container').style.gridColumnEnd = "span 3"

    // move the summary table to the third column
    document.getElementById('summaryTable').style.gridColumn = 3;

    // show the beer table and mark as shown
    document.getElementById('beerTable').style.display = 'block';
    document.getElementById('beerTable').className = 'shown';
  }
}

function removeTable() {
  if (document.getElementById('beerTable').getAttribute('class') == 'shown') {
    // remove the third column
    document.getElementById('panes').style.gridTemplateColumns = '50% 50%';

    //resize the map
    document.getElementById('map-container').style.gridColumnEnd = "span 2"

    // move the summary table to the second column
    document.getElementById('summaryTable').style.gridColumn = 2;

    // hide the beer table and mark as hidden
    document.getElementById('beerTable').style.display = 'none';
    document.getElementById('beerTable').className = 'hidden';
  }
}

function filterTable() {
  UpdateBreweryTable(globalData.slice(0, 15));
}
