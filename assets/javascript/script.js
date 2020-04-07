const DEGREE_FAHRENHEIT = "&#8457;";
const DEGREE_CELCIUS = "&#8451;";
const DEFAULT_CITY = "San Clemente, California";
const OPEN_WEATHER_APPID = "909d9a0c309725bb1dee62d3d268a4ee";
var SEARCH_CITY = "San+Clemente";
// var OPEN_WEATHER_FIVE_DAY_FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${SEARCH_CITY}&appid=${OPEN_WEATHER_APPID}`;
var OPEN_WEATHER_FIVE_DAY_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
// var OPEN_WEATHER_CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?q=${SEARCH_CITY}&appid=${OPEN_WEATHER_APPID}`;
var OPEN_WEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
// List of places for which weather has ben searched. San Clemente, CA is default
const DEFAULT_CITY_SEARCH_HISTORY = [
  "Irvine, CA",
  "San Clemente, CA",
  "New York, NY",
  "London, GB",
  "Lagos NG",
  "Abuja, NG",
];
const DEFAULT_TEMPERATURE_UNIT = "Fahrenheit";
const DEFAULT_STORAGE_DATA = { temperatureUnit: DEFAULT_TEMPERATURE_UNIT, cities: DEFAULT_CITY_SEARCH_HISTORY };
const LOCAL_STORAGE_KEY = "WeatherDashboard";
// global to hold local storage data
var localStorageData;
/*
 * Returns the jQuery object that represents the forcast card.
 * @param forecastDate Date of forecast in yyyy/mm/dd format
 * @param iconId ID of ICON from OpenweatherMap.org
 * @param temperature Temperature in tempScale
 * @tempScale Temperature measurement scate in "F" or "C". Default is "C";
 * @humidity Atmospheric humidity in %
 */
function generateForecastCardJQ(forecastDate, iconId, temperature, tempScale, humidity) {
  switch (tempScale) {
    case ("F", "f"):
      tempScale = DEGREE_FAHRENHEIT;
      break;
    case ("C", "c"):
      tempScale = DEGREE_CELCIUS;
      break;
    default:
      tempScale = DEGREE_CELCIUS;
  }
  var divHTML = `<div class="col card card-body forecast-card">
    <h4 class="forecast-h4">${forecastDate}</h4>
    <img src="http://openweathermap.org/img/wn/${iconId}@2x.png" alt="weather icon" />
    <h5 class="forecast-h5 forecast-temp">Temp:&nbsp;${temperature}${tempScale}</h5>
    <h5 class="forecast-h5">Humidity:&nbsp;${humidity}%</h5>
  </div>`;
  return $(divHTML);
}

$(document).ready(function () {
  console.log("Temperature Unit Selected ==> " + getTemperatureUnitSelection());

  // initialize storage information
  localStorageData = initializeLocalStorage();
  // initialize the UI with the data
  initializeUI();

  $("#search-city-button").on("click", function (event) {
    searchCityButtonEventListener(event);
  });

  $("#temperature-unit-select").on("change", function (event) {
    console.log("Temperature selection ==> " + getTemperatureUnitSelection());
    temperatureUnitSelectListener(event);
  });
});

/**
 * Updates the current weather portion of the UI
 * @param  response Current Weather Object
 */
function updateCurrentWeatherUI(response) {
  var cityName = response.name;
  var cityTemp;
}
function updateRandomUV() {
  // generate random UVI info
  var uvInfo = generateUVInfo();
  var jqUVEl = $("#city-uv-index");
  console.log("UV Index ==> " + uvInfo.uvi + "\nUV Color ==> " + uvInfo.color);
  jqUVEl.text(uvInfo.uvi);
  jqUVEl.css("background-color", uvInfo.color);
  jqUVEl.css("color", "whitesmoke");
  if (uvInfo.color.toLowerCase() == "yellow") {
    jqUVEl.css("color", "black");
  }
}

/**
 * Uses AJAX to get the current weather for the specified city/location
 * @param searchCity The location for which weather is sought
 */
function getCurrentWeather(searchCity) {
  var retval = null;
  if (searchCity == null) searchCity = SEARCH_CITY;
  var queryURL = `${OPEN_WEATHER_CURRENT_URL}${searchCity}&appid=${OPEN_WEATHER_APPID}`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response);
  });
}

function getForecastWeather(searchCity) {
  var retval = null;
  if (searchCity == null) searchCity = SEARCH_CITY;
  var queryURL = `${OPEN_WEATHER_FIVE_DAY_FORECAST_URL}${searchCity}&appid=${OPEN_WEATHER_APPID}`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    retval = response;
  });
  return retval;
}

function kelvinToCelcius(kelvin) {
  if (!Number.isInteger) return NaN;
  return Number.parseInt(kelvin) - 273.15;
}

/*
 * To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32
 * @param kelvin Temperature in degrees Kelvin
 */
function kelvinToFahrenheit(kelvin) {
  if (!Number.isInteger) return NaN;
  return (Number.parseInt(kelvin) - 273.15) * 1.8 + 32;
}

/**
 * Returns an object containing the color and value of a randomly generated
 * UV index. For example {uvi:8.1,color:red}. UVI ranges from 0 10 10 as follows:
 * 0 to 2	Green	"Low"
 * 3 to 5	Yellow	"Moderate"
 * 6 to 7	Orange	"High"
 * 8 to 10	Red	    "Very high"
 */
function generateUVInfo() {
  var num = Math.random() * 11;
  var uvi = num.toFixed(2);
  var uvc = "red"; // UV Color
  if (uvi > 10.0) uvi = "10.0";
  if (uvi < 3.0) uvc = "green";
  else if (uvi < 6.0) uvc = "yellow";
  else if (uvi < 8.0) uvc = "orange";
  var retval = { uvi: uvi, color: uvc };
  return retval;
}

/**
 * Initializea the localStorage. If there is data in there, load and return it.
 * Otherwise populate with default data
 */
function initializeLocalStorage() {
  var retval;
  var storeData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (retval == null) {
    if (storeData != null) {
      retval = JSON.parse(storeData);
    } else {
      retval = DEFAULT_STORAGE_DATA;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(retval));
    }
  }
  return retval;
}

function updateLocalStorage(dataStore) {
  if (dataStore == null) dataStore = localStorageData;
  if (dataStore != null) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataStorage));
    localStorageData = dataStore;
  }
  return dataStore;
}

function initializeUI() {
  // get the temperature unit and set it
  var tempUnit = localStorageData.temperatureUnit;
  var cities = localStorageData.cities;
  var jqCitiesListDiv = $("#city-history-list-group");
  jqCitiesListDiv.empty();
  for (let index = 0; index < cities.length; index++) {
    var city = cities[index];
    // var html = `<button type="button" class="list-group-item list-group-item-action ">${city}</button>`;
    var cityBtn = $(`<button type="button" class="list-group-item list-group-item-action ">${city}</button>`);
    jqCitiesListDiv.append(cityBtn);
  }
  if (tempUnit.toLowerCase() == "fahrenheit") $("#temperature-unit-select").prop("checked", true);
  else $("#temperature-unit-select").prop("checked", false);
}
/**
 * Returns "Fahrenheit" or "Celcius" depending on the setting of the
 * Temperature selection toggle
 */
function getTemperatureUnitSelection() {
  var retval = "Celcius";
  if ($("#temperature-unit-select").prop("checked") == true) retval = "Fahrenheit";
  return retval;
}
