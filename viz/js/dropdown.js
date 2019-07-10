var initialized = false; // resort to global variables for now...
//var stationsQuery = "https://geo.weather.gc.ca/geomet/features/collections/climate-stations/items"

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropDown() {
  document.getElementById("myDropdown").classList.toggle("show");

  if (!initialized) {
    console.log('not initialized');
    populateDropdown();
    initialized = true;
  }
}

/* read all stations, filter based on data and add to the dropdown list */
function populateDropdown() {
  //console.log(allStations);
  filteredStations = allStations.features.filter( (data) => {
    let check = data.properties.FIRST_DATE.substring(0,4);
    //console.log(check);
    //console.log(check < "1970");
    return check < "1970";
  });

  var $dropdown = $('#myDropdown');

  filteredStations.forEach( (data) => {
    let name = data.properties.STATION_NAME;
    //console.log(data.properties.STATION_NAME);
    let $a = $("<a>", {id: name}).text(name);
    //console.log($a);
    $dropdown.append($a);
  });
}


/* use the search bar to filter stations */
function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}



