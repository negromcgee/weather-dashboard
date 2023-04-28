const { default: dayjs } = require("dayjs-ext");

// Global variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = "186388b4dd9e731049fc26ae93a4789f";

// DOM element references
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayE1 = document.querySelector('#today');
var forecastE1 = document.querySelector('#forecast');
var historyE1 = document.querySelector('#history');
var searchHistory = [];


// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);


// Function to display the search history list.
function renderDaily(data, city) {
  searchHistoryContainer.innerHTML = '';

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) {
    var btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-controls', 'today forecast');
    btn.classList.add('history-btn', 'btn-history');

    // `data-search` allows access to city name when click handler is invoked
    btn.setAttribute('data-search', searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistoryContainer.append(btn);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) {
    return;
  }
  searchHistory.push(search);

  localStorage.setItem('search-history', JSON.stringify(searchHistory));
  renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() {
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  // Store response data from our fetch request in variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  cardTitle.classList.add("weather-title", "col-12", "pb-2");
  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');
  card.append(cardBody);

  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.innerHTML = '';
  todayContainer.append(card);
}

// Function to display a forecast card given an object from open weather api
// daily forecast.
function renderForecastCard(data) {
  // variables for data from api
  var iconUrl = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
  var iconDescription = data.weather[0].description;
  var tempF = data.main.temp;
  var humidity = data.main.humidity;
  var windMph = data.wind.speed;

  // Create elements for a card
  var col = document.createElement('div');
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var cardTitle = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // Add content to elements
  cardTitle.textContent =  "[" + dayjs(forcast.dt_txt).format("MM-DD-YYYY") + "]";
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = "Temperature: " + temperature + "°F";
  windEl.textContent = "Wind Speed: " + windSpeed + "MPH";
  humidityEl.textContent = "Humdidity: " + humidity + "%";

  col.appendChild(card);
  card.appendChild(cardContent);
  cardTitle.appendChild(weatherIcon);
  cardBody.appendChild(title);
  cardBody.appendChild(temperatureEl);
  cardBody.appendChild(humidityEl);
  cardBody.appendChild(windSpeedEl);

  forecastContainer.append(col);
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast) {
  // Create unix timestamps for start and end of 5 day forecast
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h3');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = "5 Day Forecast For: " + city;
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      // Then filters through the data and returns only data captured at noon for each day.
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list, city);
}

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl =  weatherAPIRoot + "/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + weatherAPIKey;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var apiUrl = weatherAPIRoot + "/geo/1.0/direct?q=" + search + "&limit=5&appid=" + weatherAPIKey;

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(event) {
  // Don't continue if there is nothing in the search form
  if (!searchInput.value) {
    return;
  }

  event.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(data);
  searchInput.value = '';
}

function handleSearchHistoryClick(event) {
  // Don't do search if current elements is not a search history button
  if (event.target.matches('.btn-history')) {
    var btn = event.target;
  var data = btn.getAttribute('data-search');
  fetchCoords(data);
    return;
  }

}

initSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
historyE1.addEventListener('click', handleSearchHistoryClick);

