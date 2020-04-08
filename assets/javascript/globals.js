const DEGREE_FAHRENHEIT = "&#8457;";
const DEGREE_CELCIUS = "&#8451;";
const DEFAULT_CITY = "San Clemente, California";
const OPEN_WEATHER_APPID = "909d9a0c309725bb1dee62d3d268a4ee";
var SEARCH_CITY = "San+Clemente";
var OPEN_WEATHER_FIVE_DAY_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?q=";
var OPEN_WEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather?q=";
// List of places for which weather has ben searched. San Clemente, CA is default
const DEFAULT_CITY_SEARCH_HISTORY = [
  "Irvine, US",
  "San Clemente, US",
  "New York, US",
  "London, GB",
  "Lagos, NG",
  "Abuja, NG",
  "Tokyo, JP",
];
const DEFAULT_TEMPERATURE_UNIT = "Fahrenheit";
const DEFAULT_STORAGE_DATA = {
  temperatureUnit: DEFAULT_TEMPERATURE_UNIT,
  cities: DEFAULT_CITY_SEARCH_HISTORY,
  activeCity: DEFAULT_CITY_SEARCH_HISTORY[0],
};
const LOCAL_STORAGE_KEY = "WeatherDashboard";
// global to hold local storage data
var localStorageData;
//
// Maximum number of cities to have in the cities history list
const CITIES_HISTORY_MAX = 10;
