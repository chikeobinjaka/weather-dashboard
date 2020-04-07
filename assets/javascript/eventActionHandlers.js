function searchCityButtonEventListener(event) {
  console.log("Search Button clicked");
  // get input
  event.preventDefault();
  var inputVal = $("#search-city-input").val();
  console.log(inputVal);
  if (inputVal == null) return;
  inputVal = inputVal.trim();
  if (inputVal.length == 0) return;
  // get rid of multiple spaces and replace with "+"
  var searchCity = inputVal.replace(/ +/g, "+");

  updateRandomUV();

  var queryURL = `${OPEN_WEATHER_CURRENT_URL}${searchCity}&appid=${OPEN_WEATHER_APPID}`;
  $.ajax({
    url: queryURL,
    method: "GET",
    statusCode: {
      404: function () {
        alert("404 Error. Location data not found");
      },
    },
  }).then(function (response) {
    console.log(response);
    updateCurrentWeatherUI(response);
  });
}
