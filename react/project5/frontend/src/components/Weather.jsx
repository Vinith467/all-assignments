// src/components/Weather.jsx
import React, { useEffect, useState } from "react";

function Weather() {
  const [city, setCity] = useState("Delhi"); // default city
  const [weatherData, setWeatherData] = useState(null); // to store fetched data
  const [loading, setLoading] = useState(false); // to show loading state
  const [error, setError] = useState(null); // to handle errors

  const API_KEY = "3e292dfe74e54cd5a565c43e1baa7ba8";
  useEffect(() => {
    if (!city) return; // if input is empty, don't fetch

    const controller = new AbortController(); // for cleanup (cancel request)
    const signal = controller.signal;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.weatherbit.io/v2.0/current?city=${city}&key=${API_KEY}`,
          { signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        setWeatherData(data.data[0]); // Weatherbit returns data inside data[0]
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Cleanup function — cancel ongoing request if city changes or component unmounts
    return () => controller.abort();
  }, [city]); // ✅ dependency array → refetch when city changes

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>🌤️ Weather Dashboard</h2>

      {/* City input */}
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name"
        style={{ padding: "8px", marginRight: "10px" }}
      />
      <button
        onClick={() => setCity(city)}
        style={{
          padding: "8px 12px",
          background: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Get Weather
      </button>

      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Error state */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Weather Info */}
      {weatherData && !loading && !error && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            width: "300px",
            margin: "20px auto",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h3>{weatherData.city_name}</h3>
          <p>Temperature: {weatherData.temp}°C</p>
          <p>Weather: {weatherData.weather.description}</p>
          <p>Country: {weatherData.country_code}</p>
        </div>
      )}
    </div>
  );
}

export default Weather;
