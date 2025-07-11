const apiKey = "<Unsplash API Key>"; // Replace with your actual key

// ENTER key support
document.getElementById("cityInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    getWeather();
  }
});

// Fetch forecast by city
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("City not found.");
      return res.json();
    })
    .then(showWeatherForecast)
    .catch((err) => {
      document.getElementById("weatherResult").innerHTML =
        `<p class="text-red-500">${err.message}</p>`;
    });
}

// Fetch forecast by coordinates (on page load)
function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then(showWeatherForecast)
    .catch(() => {
      document.getElementById("weatherResult").innerHTML =
        `<p class="text-red-500">Unable to get your location's weather.</p>`;
    });
}

// Display weather and today's min/max
function showWeatherForecast(data) {
  const lat = data.city.coord.lat;
  const lon = data.city.coord.lon;

  const timezoneApiKey = "<TimeZone Api Key>"; // Replace with your actual key

  fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`)
    .then(res => res.json())
    .then(timeData => {
      // ✅ Use correctly formatted local date and time
      const localDateStr = timeData.formatted.split(" ")[0]; // "YYYY-MM-DD"
      const localDate = new Date(timeData.formatted); // local time as Date object

      // Filter temperatures for today's date
      const todayTemps = data.list.filter(item => item.dt_txt.startsWith(localDateStr));
      const temps = todayTemps.map(item => item.main.temp);
      const minTemp = temps.length ? Math.min(...temps) : data.list[0].main.temp;
      const maxTemp = temps.length ? Math.max(...temps) : data.list[0].main.temp;

      const current = data.list[0];
      const iconUrl = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
      const flagUrl = `https://flagsapi.com/${data.city.country}/flat/32.png`;

      // Format local time for display
      const cityTimeStr = localDate.toLocaleString("en-US", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const weatherHTML = `
        <h2 class="text-xl font-bold">${data.city.name}, ${data.city.country}
          <img src="${flagUrl}" class="inline ml-2" />
        </h2>
        <p class="text-sm mb-2">${cityTimeStr}</p>
        <img src="${iconUrl}" alt="Weather icon" class="mx-auto"/>
        <p>🌡️ <strong>Temp:</strong> ${current.main.temp}°C (feels like ${current.main.feels_like}°C)</p>
        <p>🌈 <strong>Today Min/Max:</strong> ${minTemp.toFixed(1)}°C / ${maxTemp.toFixed(1)}°C</p>
        <p>☁️ <strong>Weather:</strong> ${current.weather[0].description}</p>
        <p>💧 <strong>Humidity:</strong> ${current.main.humidity}%</p>
        <p>🌬️ <strong>Wind:</strong> ${current.wind.speed} m/s</p>
      `;

      document.getElementById("weatherResult").innerHTML = weatherHTML;

      updateBackground(data.city.name, () => {
        generateWeatherCard(data);
      });
    })
    .catch(err => {
      console.error("Timezone fetch error:", err);
      alert("Could not fetch accurate time for this location.");
    });
}




function generateWeatherCard(data) {
  const current = data.list[0];
  const city = data.city.name;
  const country = data.city.country;
  const temp = current.main.temp;
  const weatherDesc = current.weather[0].description;
  const backgroundImage = document.body.style.backgroundImage;

  const quotes = {
    Clear: [
      "Clear skies, clear mind.",
      "Sunshine is the best medicine.",
      "The sky’s the limit when it’s this clear."
    ],
    Clouds: [
      "Every cloud has a silver lining.",
      "Gray skies make bright hearts.",
      "Overcast days have their charm."
    ],
    Rain: [
      "Let the rain wash your worries away.",
      "Dance in the rain, not wait for the storm to pass.",
      "Raindrops are nature’s lullaby."
    ],
    Snow: [
      "Snowflakes are kisses from heaven.",
      "Let it snow, let it glow.",
      "Winter magic is in the air."
    ],
    Thunderstorm: [
      "Even storms bring strength.",
      "Thunder roars, but rain nourishes.",
      "Power lies in the storm."
    ],
    Drizzle: [
      "Tiny drops, big refresh.",
      "Soft drizzle, calm soul.",
      "A gentle rain speaks volumes."
    ],
    Mist: [
      "Misty mornings bring new beginnings.",
      "In mist we trust for mystery.",
      "Soft fog, strong heart."
    ],
    Haze: [
      "Even the haze can't dim your shine.",
      "Through the haze, we rise.",
      "Golden light behind the haze."
    ]
  };

  const condition = current.weather[0].main;
  const conditionQuotes = quotes[condition] || ["Weathering it beautifully!"];
  const quote = conditionQuotes[Math.floor(Math.random() * conditionQuotes.length)];

    // Set card content
  document.getElementById("cardCity").innerText = `${city}, ${country}`;
  document.getElementById("cardWeather").innerText = `${weatherDesc}, ${temp.toFixed(1)}°C`;
  document.getElementById("cardQuote").innerText = `"${quote}"`;

  const card = document.getElementById("weatherCard");
  document.getElementById("cardImage").src = currentCityImageUrl;

  // Show the preview button instead of the card directly
  document.getElementById("shareBtnWrapper").classList.remove("hidden");

}

let currentCityImageUrl = ""; // Global variable to store background image

function updateBackground(cityName, callback) {
  const query = cityName;

  fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`)
    .then(res => res.json())
    .then(data => {
      const pages = data.query.pages;
      const firstPage = Object.values(pages)[0];
      const imageUrl = firstPage.thumbnail?.source;

      if (imageUrl) {
        currentCityImageUrl = imageUrl;

        document.body.style.backgroundImage = `url('${imageUrl}')`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
      }

      if (typeof callback === "function") {
        callback();  // ✅ Call generateWeatherCard() only after image loads
      }
    })
    .catch(err => {
      console.warn("Error fetching landmark image from Wikipedia:", err);
      if (typeof callback === "function") callback();
    });
}



// 📸 SHARE card as an image
function shareWeatherCard() {
  const card = document.getElementById("weatherCard");

  html2canvas(card, { useCORS: true, scale: 2 }).then(canvas => {
    canvas.toBlob(blob => {
      const file = new File([blob], "weather-card.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: "Weather Card",
          text: "Check out this weather snapshot!",
        }).catch(err => console.error("Share failed:", err));
      } else {
        const link = document.createElement("a");
        link.download = "weather-card.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        alert("Sharing not supported on this browser. Image downloaded instead.");
      }
    });
  });
}

// 🌍 Auto detect user's location on load
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    },
    (error) => {
      console.warn("Geolocation blocked or failed.", error);
    }
  );
}

function openCardPopup() {
  document.getElementById("weatherModal").classList.remove("hidden");
}

function closeCardPopup() {
  document.getElementById("weatherModal").classList.add("hidden");
}
