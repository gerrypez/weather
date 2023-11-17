# Lift Paragliding: SF Bay Area Forecast

This app is used by paraglider and hang glider pilots in the San Francisco Bay Area. It uses the NWS API to show an overview of which sites might be flyable.

View the app here -->

### `how this app works`

This app uses the NWS API. Examples of API calls...

Starting with a GPS point, getting the NWS grid information:
https://api.weather.gov/points/37.911,-122.625

With the grid information, getting the weather forecast
https://api.weather.gov/gridpoints/MTR/79,113/forecast/hourly

Once the weather forecasts is aquired, the app uses the Arraydata.jsx file to compare the wind speed and direction desired to the forecast, and day box colors are calculated.
