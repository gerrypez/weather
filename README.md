# weatheralert
 Lift Paragliding: SF Bay Area Forecast

Using NWS point forecasts, this calculates if paragliding wind conditions are good

NWS API https://www.weather.gov/documentation/services-web-api

Start with Lat, Lon to get the Station and Grid X, Y
https://api.weather.gov/points/37.674,-122.495

"forecastHourly" is in the response (used for Wind info)
https://api.weather.gov/gridpoints/MTR/84,122/forecast/hourly

"forecastGridData" is in the response - not used currently
https://api.weather.gov/gridpoints/MTR/104,152