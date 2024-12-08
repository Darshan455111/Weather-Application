import React, { useState } from "react";
import "./WeatherApp.css";

const WeatherApp = () => {
  const [userLocation, setUserLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [unit, setUnit] = useState("°C");

  const WEATHER_API_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.local.REACT_APP_WEATHER_API_KEY}&q=`;
  const WEATHER_DATA_ENDPOINT = `https://api.openweathermap.org/data/3.0/onecall?appid=${process.env.local.REACT_APP_WEATHER_API_KEY}&exclude=minutely,hourly,alerts&units=metric&`;
  

  const findUserLocation = () => {
    fetch(WEATHER_API_ENDPOINT + userLocation)
      .then((response) => response.json())
      .then((data) => {
        if (data.cod !== 200) {
          alert(data.message);
          return;
        }

        const cityData = {
          name: data.name,
          country: data.sys.country,
          lon: data.coord.lon,
          lat: data.coord.lat,
          icon: data.weather[0].icon,
        };

        fetch(
          `${WEATHER_DATA_ENDPOINT}lon=${cityData.lon}&lat=${cityData.lat}`
        )
          .then((response) => response.json())
          .then((details) => {
            setWeatherData({
              ...cityData,
              temp: details.current.temp,
              feelsLike: details.current.feels_like,
              description: details.current.weather[0].description,
              humidity: details.current.humidity,
              windSpeed: details.current.wind_speed,
              sunrise: details.current.sunrise,
              sunset: details.current.sunset,
              clouds: details.current.clouds,
              uvi: details.current.uvi,
              pressure: details.current.pressure,
              timezoneOffset: details.timezone_offset,
            });

            setForecastData(details.daily);
          });
      });
  };

  const formatUnixTime = (dtValue, offset, options = {}) => {
    const date = new Date((dtValue + offset) * 1000);
    return date.toLocaleString("en-US", { timeZone: "UTC", ...options });
  };

  const tempConverter = (temp) => {
    const roundedTemp = Math.round(temp);
    return unit === "°C"
      ? `${roundedTemp}°C`
      : `${Math.round((roundedTemp * 9) / 5 + 32)}°F`;
  };

  return (
    <div className="container">
      <div className="weather-input">
        <div className="input-group">
          <input
            type="text"
            id="userLocation"
            placeholder="Search city"
            value={userLocation}
            onChange={(e) => setUserLocation(e.target.value)}
          />
          <select
            className="converter"
            id="converter"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option>°C</option>
            <option>°F</option>
          </select>
          <i className="fa fa-search" onClick={findUserLocation}></i>
        </div>
        {weatherData && (
          <>
            <div
              className="weatherIcon"
              style={{
                backgroundImage: `url(https://openweathermap.org/img/wn/${weatherData.icon}@2x.png)`,
              }}
            ></div>
            <h2 className="temprature">{tempConverter(weatherData.temp)}</h2>
            <div className="feelsLike">
              Feels like: {tempConverter(weatherData.feelsLike)}
            </div>
            <div className="description">{weatherData.description}</div>
            <hr />
            <div className="date">
              {formatUnixTime(weatherData.sunrise, weatherData.timezoneOffset, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
            <div className="city">
              {weatherData.name}, {weatherData.country}
            </div>
          </>
        )}
      </div>
      <div className="weather-output">
        <h2 className="heading">Today's Highlights</h2>
        {weatherData && (
          <div className="highlight">
            <div className="humidity">
              Humidity: {weatherData.humidity}%
            </div>
            <div className="winds-speed">
              Wind Speed: {weatherData.windSpeed} m/s
            </div>
            <div className="sun">
              <span>Sunrise: {formatUnixTime(weatherData.sunrise, weatherData.timezoneOffset, { hour: "numeric", minute: "numeric", hour12: true })}</span>
              <span>Sunset: {formatUnixTime(weatherData.sunset, weatherData.timezoneOffset, { hour: "numeric", minute: "numeric", hour12: true })}</span>
            </div>
            <div className="clouds">Clouds: {weatherData.clouds}%</div>
            <div className="uv-index">UV Index: {weatherData.uvi}</div>
            <div className="pressure">Pressure: {weatherData.pressure} hPa</div>
          </div>
        )}
        <h2 className="heading">Forecast</h2>
        <div className="Forecast">
          {forecastData.map((day, index) => (
            <div key={index}>
              <div>
                {formatUnixTime(day.dt, 0, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt="Weather icon"
              />
              <p>{day.weather[0].description}</p>
              <span>
                {tempConverter(day.temp.min)} - {tempConverter(day.temp.max)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
