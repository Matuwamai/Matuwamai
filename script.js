// Replace with  free API key from https://openweathermap.org/api
const API_KEY = "f74ad641ec2cfc6b813af71ae762be57"; 

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Search city
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (city === "") {
    alert("Please enter a city name!");
    return;
  }
  fetchWeather(city);
}

// Fetch weather data
async function fetchWeather(city) {
  try {
    // Current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      alert("City not found!");
      return;
    }

    displayCurrentWeather(weatherData);
    changeBackground(weatherData.weather[0].main);

    // Forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastRes.json();
    displayForecast(forecastData.list);

    // Add to favorites if not already
    if (!favorites.includes(city)) {
      favorites.push(city);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// Show current weather with extras
function displayCurrentWeather(data) {
  const container = document.getElementById("currentWeather");

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

  container.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
    <p><strong>Sunrise:</strong> ${sunrise}</p>
    <p><strong>Sunset:</strong> ${sunset}</p>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
  `;
}

// Show 5-day forecast
function displayForecast(list) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";

  const daily = list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <h3>${new Date(item.dt_txt).toLocaleDateString()}</h3>
      <p>${item.main.temp}°C</p>
      <p>${item.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
    `;
    container.appendChild(card);
  });
}

// Render favorites with remove option
function renderFavorites() {
  const favContainer = document.getElementById("favorites");
  favContainer.innerHTML = "";

  favorites.forEach(city => {
    const wrapper = document.createElement("div");

    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => fetchWeather(city);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-btn");
    removeBtn.onclick = () => removeFavorite(city);

    wrapper.appendChild(btn);
    wrapper.appendChild(removeBtn);
    favContainer.appendChild(wrapper);
  });
}

// Remove city from favorites
function removeFavorite(city) {
  favorites = favorites.filter(c => c !== city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Dynamic background based on weather
function changeBackground(condition) {
  document.body.className = ""; // reset
  if (condition.includes("Clear")) {
    document.body.classList.add("sunny");
  } else if (condition.includes("Rain")) {
    document.body.classList.add("rainy");
  } else if (condition.includes("Snow")) {
    document.body.classList.add("snowy");
  } else {
    document.body.classList.add("cloudy");
  }
}

// Geolocation support
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      fetchWeather(data.name);
    } catch (err) {
      console.error("Geolocation error:", err);
    }
  });
}

// Load favorites on startup
renderFavorites();
