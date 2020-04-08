function searchCityButtonEventListener(event) {
  console.log("Search Button clicked");
  // get input
  event.preventDefault();
  var inputVal = $("#search-city-input").val();
  if (inputVal == null) return;
  inputVal = inputVal.trim();
  if (inputVal.length == 0) return;
  // get rid of multiple spaces and replace with "+"
  var searchCity = inputVal.replace(/ +/g, "+");
  console.log(searchCity);
  loadCurrentWeather(searchCity);
  loadForecastWeather(searchCity);
}

/**
 * Action Listener called when the Temperature Unit toggle is changed
 * @param {*} event
 */
function temperatureUnitSelectListener(event) {
  console.log("Temperature selection ==> " + getTemperatureUnitSelection());
  // get the setting
  var dataStore = loadLocalStorage();
  dataStore.temperatureUnit = getTemperatureUnitSelection();
  updateLocalStorage(dataStore);
  loadCurrentWeather();
  loadForecastWeather();
  // get and reset temperatures
}

function citySelectActionListener(event, jqEl) {
  console.log("City List Group Button Clicked");
  console.log(jqEl.prop("tagName"));
  console.log(jqEl.text());
  // remove "active" class from all the buttons
  jqEl.siblings().removeClass("active");
  jqEl.addClass("active");
  localStorageData.activeCity = jqEl.text();
  console.log(localStorageData.activeCity);
  updateLocalStorage();
  loadCurrentWeather();
  loadForecastWeather();
}
