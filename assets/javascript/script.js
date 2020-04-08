// const DEGREE_FAHRENHEIT = "&#8457;";
// const DEGREE_CELCIUS = "&#8451;";
// const DEFAULT_CITY = "San Clemente, California";
// const OPEN_WEATHER_APPID = "909d9a0c309725bb1dee62d3d268a4ee";
// var SEARCH_CITY = "San+Clemente";
// var OPEN_WEATHER_FIVE_DAY_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
// var OPEN_WEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
// // List of places for which weather has ben searched. San Clemente, CA is default
// const DEFAULT_CITY_SEARCH_HISTORY = [
//   "Irvine, US",
//   "San Clemente, US",
//   "New York, US",
//   "London, GB",
//   "Lagos, NG",
//   "Abuja, NG",
//   "Tokyo, JP",
// ];
// const DEFAULT_TEMPERATURE_UNIT = "Fahrenheit";
// const DEFAULT_STORAGE_DATA = {
//   temperatureUnit: DEFAULT_TEMPERATURE_UNIT,
//   cities: DEFAULT_CITY_SEARCH_HISTORY,
//   activeCity: DEFAULT_CITY_SEARCH_HISTORY[0],
// };
// const LOCAL_STORAGE_KEY = "WeatherDashboard";
// // global to hold local storage data
// var localStorageData;
/*
 * Returns the jQuery object that represents the forcast card.
 * @param forecastDate Date of forecast in yyyy/mm/dd format
 * @param iconId ID of ICON from OpenweatherMap.org
 * @param temperature Temperature in tempScale
 * @tempScale Temperature measurement scate in "F" or "C". Default is "C";
 * @humidity Atmospheric humidity in %
 */
function generateForecastCardJQ(forecastDate, iconId, temperature, tempScale, humidity) {
  if (logIt) {
    console.log("ForecastDate ==> " + forecastDate);
    console.log("IconID       ==> " + iconId);
    console.log("Temperature  ==> " + temperature);
    console.log("TempScale    ==> " + tempScale);
    console.log("Humidity     ==> " + humidity);
  }
  switch (tempScale) {
    case "F":
    case "f":
      tempScale = DEGREE_FAHRENHEIT;
      break;
    case "C":
    case "c":
      tempScale = DEGREE_CELCIUS;
      break;
    default:
      tempScale = DEGREE_CELCIUS;
  }
  var divHTML = `<div class="col card card-body forecast-card">
    <h4 class="forecast-h4">${forecastDate}</h4>
    <img src="http://openweathermap.org/img/wn/${iconId}@2x.png" alt="weather icon" />
    <h5 class="forecast-h5 forecast-temp">Temp:&nbsp;<span data-temp-unit="${tempScale}">${temperature}</span>${tempScale}</h5>
    <h5 class="forecast-h5">Humidity:&nbsp;${humidity}%</h5>
  </div>`;
  return $(divHTML);
}

$(document).ready(function () {
  // initialize storage information
  localStorageData = loadLocalStorage();
  if (logIt) console.log(localStorageData);
  // initialize the UI with the data
  initializeUI();
  loadCurrentWeather();
  loadForecastWeather();

  $("#search-city-button").on("click", function (event) {
    event.preventDefault();
    searchCityButtonEventListener(event);
  });

  $("#temperature-unit-select").on("change", function (event) {
    event.preventDefault();
    temperatureUnitSelectListener(event);
  });

  $(".list-group-item").on("click", function (event) {
    event.preventDefault();
    citySelectActionListener(event, $(this));
  });
});

function updateRandomUV() {
  // generate random UVI info
  var uvInfo = generateUVInfo();
  var jqUVEl = $("#city-uv-index");
  if (logIt) console.log("UV Index ==> " + uvInfo.uvi + "\nUV Color ==> " + uvInfo.color);
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
function loadCurrentWeather(searchCity) {
  var retval = null;
  if (searchCity == null) searchCity = localStorageData.activeCity;
  var queryURL = `${OPEN_WEATHER_CURRENT_URL}${searchCity}&appid=${OPEN_WEATHER_APPID}`;
  var isAjaxError = false;
  $.ajax({
    url: queryURL,
    method: "GET",
    statusCode: {
      404: function () {
        isAjaxError = true;
        alert("404 Error. Location data not found");
        return;
      },
    },
  }).then(function (response) {
    if (isAjaxError) return;
    if (logIt) console.log(response);
    // update city header and date
    dateString = formatDate(Date.now(), "-");
    var location = response.name + ", " + response.sys.country;
    $("#city-name-date-heading").text(location + " (" + dateString + ")");
    // **************************
    // update the current weather
    val = response.main.temp;
    var tempUnit = "F";
    var tempSymbol = DEGREE_FAHRENHEIT;
    if (localStorageData.temperatureUnit == "Fahrenheit") val = kelvinToFahrenheit(val);
    else {
      val = kelvinToCelcius(val);
      tempUnit = "C";
      tempSymbol = DEGREE_CELCIUS;
    }
    // get the temperature value SPAN element and set the temp and data-temp-unit attribute
    $("#city-temp").text(val);
    $("#city-temp").attr("data-temp-unit", tempUnit);
    // set the temp-type SPAN element
    $("#temp-type").html(tempSymbol);
    // ************************
    // update humidity
    $("#city-humidity").text(response.main.humidity);
    // ********************************
    // update wind speed. Default unit is meters/sec. Convert by multiplying
    // with 2.236936
    $("#city-windspeed").text((response.wind.speed * 2.236936).toFixed(1));
    updateRandomUV();
  });
}

/**
 * Get the weather forecast for the specified city
 * @param  searchCity
 */
function loadForecastWeather(searchCity) {
  if (searchCity == null) searchCity = localStorageData.activeCity;
  var queryURL = `${OPEN_WEATHER_FIVE_DAY_FORECAST_URL}${searchCity}&appid=${OPEN_WEATHER_APPID}`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    if (logIt) console.log(response);
    // grab every 8th data from the forecast array
    const OneDayInMilli = 23 * 60 * 60 * 1000;
    var forecastDt = Date.now() + OneDayInMilli;
    if (logIt) console.log("[Now] " + Date.now() + " ==> " + formatDateTime(Date.now()));
    if (response.cnt >= 1) {
      // empty the forecast DIV
      var jqForecastDiv = $("#forecast-cards-div");
      jqForecastDiv.empty();

      for (let index = 0; index < response.cnt; index++) {
        var forecast = response.list[index];
        var dt = forecast.dt * 1000; // convert to milliseconds
        if (dt > forecastDt) {
          forecast = response.list[index - 1];
          forecastDt += OneDayInMilli;
          var forecastTimeMilli = forecast.dt * 1000;
          if (logIt) console.log("[" + (index - 1) + "] " + dt + " ==> " + formatDateTime(forecastTimeMilli));
          // get the forecast card
          var forecastDate = formatDate(forecastTimeMilli, "/");
          var iconId = forecast.weather[0].icon;
          var temperature;
          var tempScale = "C";
          if (localStorageData.temperatureUnit[0] == "F") {
            temperature = kelvinToFahrenheit(forecast.main.temp);
            tempScale = "F";
          } else {
            temperature = kelvinToCelcius(forecast.main.temp);
          }
          var humidity = forecast.main.humidity;
          var forecastDiv = generateForecastCardJQ(forecastDate, iconId, temperature, tempScale, humidity);
          jqForecastDiv.append(forecastDiv);
        }
      }
      // update active City from response
      var cityId = response.city.name + ", " + response.city.country;
      if (logIt) console.log(`CityID ==> ${cityId}`);
      var dataStore = loadLocalStorage();
      dataStore.activeCity = cityId;
      updateLocalStorage(dataStore);
      // now search city list to see if cityId is there
      var cityList = $(".list-group-item");
      if (logIt) console.log(cityList);
      var found = false;
      for (let index = 0; index < cityList.length; index++) {
        var cityBtn = cityList[index];
        if (logIt) console.log("[" + index + "] " + cityBtn.textContent);
        if (cityId == cityBtn.textContent) {
          found = true;
          break;
        }
      }
      // if the cityId is not found, prepend it as the first element under
      // the #city-history-list-group DIV. First check if we have reached the
      // limit of how many cities we can include
      if (!found) {
        var len = $("#city-history-list-group").children().length;
        if (logIt) console.log("Cities History Length ==> " + len);
        if (len >= CITIES_HISTORY_MAX) {
          var cities = $("#city-history-list-group").children();
          var lastChild = $(".list-group-item-action").last();
          lastChild[0].remove();
          if (logIt) {
            console.log("Last Child ==> " + lastChild[0]);
            console.log(cities);
            console.log(cities[len - 1]);
          }
          // create a new entry for the search history list,
          // prepend it and select it
          $(".list-group-item-action").removeProp("active");
          var btn = $(`<button type="button" class="list-group-item list-group-item-action active">${cityId}</button>`);
          $("#city-history-list-group").prepend(btn);
          // btn.on("click",function (event){
          //   event.preventDefault();
          //   citySelectActionListener(event, $(this));
          // });
          // remove the last entry from the cities array in localStorage
          dataStore = loadLocalStorage();
          dataStore.cities.pop();
          dataStore.cities.unshift(cityId);
          updateLocalStorage(dataStore);
          // remove old action listeners on the history buttons
          $(".list-group-item").off("click");
          // remove and re-create buttons
          initializeUI();
          // put back action listeners
          $(".list-group-item").on("click", function (event) {
            event.preventDefault();
            citySelectActionListener(event, $(this));
          });
        }
      }
    }
    // now update the last updated timer
    if (logIt) console.log("Executing reset of timer...");
    resetLastUpdatedIntervalTimer();
  });
}

function resetLastUpdatedIntervalTimer() {
  $("#last-updated").text("0.0");
  if (lastUpdatedInterval != null) {
    clearInterval(lastUpdatedInterval);
  }
  lastUpdatedInterval = setInterval(function () {
    elapsedTime += LAST_UPDATE_INTERVAL_MILLI;
    // convert milli to minutes
    var val = elapsedTime / 60000;
    if (logIt) console.log(val);
    $("#last-updated").text(val);
  }, LAST_UPDATE_INTERVAL_MILLI);
}
function kelvinToCelcius(kelvin) {
  if (!Number.isInteger) return NaN;
  return (Number.parseInt(kelvin) - 273.15).toFixed(1);
}

/*
 * To convert from Kelvin to Fahrenheit: F = (K - 273.15) * 1.80 + 32
 * @param kelvin Temperature in degrees Kelvin
 */
function kelvinToFahrenheit(kelvin) {
  if (!Number.isInteger) return NaN;
  return ((Number.parseInt(kelvin) - 273.15) * 1.8 + 32).toFixed(1);
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
function loadLocalStorage() {
  var retval = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (retval == null) {
    retval = DEFAULT_STORAGE_DATA;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(retval));
  } else {
    retval = JSON.parse(retval);
  }
  localStorageData = retval;
  return retval;
}

function updateLocalStorage(dataStore) {
  if (dataStore == null) dataStore = localStorageData;
  if (dataStore != null) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataStore));
    localStorageData = dataStore;
  }
  return dataStore;
}

/**
 * Initialize the UI with information from localStorage
 */
function initializeUI() {
  // get the temperature unit and set it
  var tempUnit = localStorageData.temperatureUnit;
  var cities = localStorageData.cities;
  var jqCitiesListDiv = $("#city-history-list-group");
  jqCitiesListDiv.empty();
  var activeCity = localStorageData.activeCity;
  var activeState = "";
  for (let index = 0; index < cities.length; index++) {
    var city = cities[index];
    if (activeCity == null && index == 0) {
      localStorageData.activeCity = city;
      activeCity = city;
      updateLocalStorage();
    }
    activeState = "";
    if (city == activeCity) {
      activeState = "active";
    }
    // var html = `<button type="button" class="list-group-item list-group-item-action ">${city}</button>`;
    var cityBtn = $(
      `<button type="button" class="list-group-item list-group-item-action ${activeState}">${city}</button>`
    );
    jqCitiesListDiv.append(cityBtn);
  }
  // set the temperature toggle
  if (tempUnit.toLowerCase() == "fahrenheit") $("#temperature-unit-select").prop("checked", true);
  else $("#temperature-unit-select").prop("checked", false);
  //
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

/**
 * Formats datetime value from milliseconds to yyyy-MM-dd
 * @param  val datetime in milliseconds since Epoch. If null, current time is used
 * @param  sep separator character. Only the first character is used
 * @returns Formatted date
 */
function formatDate(val, sep) {
  if (val == null || Number.isNaN(val)) {
    val = Date.now();
  }
  if (sep == null) sep = "-";
  var date = new Date(val);
  var dateString = date.getFullYear() + sep[0];
  var val = date.getMonth() + 1;
  if (val < 10) dateString += "0";
  dateString += val + sep[0];
  if ((val = date.getDate()) < 10) dateString += "0";
  dateString += val;
  return dateString;
}

function formatDateTime(val, sep) {
  if (val == null || Number.isNaN(val)) {
    val = Date.now();
  }
  if (sep == null) sep = "-";
  var retval = formatDate(val, sep) + "T";
  var date = new Date(val);
  /// hours
  var tmp = date.getHours();
  if (tmp < 10) retval += "0";
  retval += tmp + ":";
  // minutes
  tmp = date.getMinutes();
  if (tmp < 10) retval += "0";
  retval += tmp + ":";
  // seconds
  tmp = date.getSeconds();
  if (tmp < 10) retval += "0";
  retval += tmp + "." + date.getMilliseconds();

  return retval;
}
