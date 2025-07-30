The current weather display only shows a real-time snapshot. This issue tracks the implementation of weather data persistence and historical charting.

**Current State:**
- `showWeather()` in `assets/terminal.js` fetches data from `assets/current-weather.json`.
- `assets/current-weather.json` stores only the latest weather observation.
- No historical data storage or charting capabilities exist.

**Affected Code (example context from `assets/terminal.js` and `assets/current-weather.json`):**

`assets/terminal.js` (showWeather function):
```javascript
    async showWeather() {
        this.addDebugLog('Attempting to show weather data', 'info', 'weather');
        try {
            // Try to load current weather data
            const response = await fetch('./assets/current-weather.json');
            if (response.ok) {
                const weather = await response.json();
                // ... display current weather ...
            } else {
                // ... handle no weather data ...
            }
        } catch (_error) {
            // ... handle error ...
        }
    }
```

`assets/current-weather.json`:
```json
{
  "station": "Grove (Cygnet Area)",
  "coordinates": "-43.1647,147.0584",
  "temperature": "10.4",
  "apparent_temperature": "9.5",
  "humidity": "93",
  "wind_direction": "ENE",
  "wind_speed_kmh": "4",
  "wind_gust_kmh": "11",
  "pressure_hpa": "N/A",
  "rainfall_mm": "25.8",
  "conditions": "-",
  "weather_emoji": "☀️",
  "comfort_level": "Perfect 😌",
  "observation_time": "20250726143000",
  "updated_at": "2025-07-26T15:00:29Z",
  "visualizations": {
    "temperature_bar": "██░░░░░░░░",
    "humidity_bar": "█████████░",
    "wind_bar": "█░░░░░░░░░░"
  }
}
```

**Proposed Resolution:**
1.  **Data Persistence:**
    *   Implement a mechanism to store historical weather data. This could involve:
        *   A new JSON file (e.g., `weather/history.json`) that appends new observations.
        *   A simple local storage solution if the amount of historical data is small.
    *   Modify the CI workflow that fetches weather data to append new observations to this historical data store.
2.  **Historical Charting:**
    *   Utilize a charting library (e.g., Chart.js, already included in `index.html`) to visualize historical weather data.
    *   Implement new subcommands for `weather` (e.g., `weather chart temp`, `weather chart humidity`) to display different historical charts.
    *   The charts should display trends over time (e.g., last 24 hours, last 7 days).
3.  **Data Aggregation/Summarization:** Consider adding logic to aggregate historical data (e.g., daily averages, min/max) to reduce data size for long-term storage and faster charting.

**Labels:** `enhancement`, `priority: medium`, `type: enhancement`