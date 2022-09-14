<?php
/*
*
* Updates the MySQL table with new JSON wind forecast
*
*/

header('Access-Control-Allow-Origin: *');
// header("Access-Control-Allow-Origin: http://localhost:4200");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// display errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// connect to database
include 'db_mysqli.php';

// get data from Ajax
$station = $_POST['station'];
$site = $_POST['site'];
$gridX = $_POST['gridX'];
$gridY = $_POST['gridY'];
$gridX = intval($gridX);
$gridY = intval($gridY);
$wind_forecast = $_POST['wind_forecast']; // sent to server as a string
$json_wind_forecast = json_encode($wind_forecast);  // formatted as JSON before updating

// get update time
date_default_timezone_set('America/Los_Angeles');
$datetime_updating = date('Y-m-d H:i:s');  // ex. 2020-07-20 14:55:18

// only update if json_wind_forecast is more current than updated in MySQL  ?

// update MySQL table
$mysqli->query("UPDATE weather_forecast
SET write_date = '$datetime_updating', json_wind = $json_wind_forecast
WHERE gridX = $gridX AND gridY = $gridY");

// echo is returned to javascript page
echo $site, ' nws_update_mysql.php done', $station, ' ', $gridX, ' ', $gridY;

// if ($site = "ed_levin") {
//     echo $json_wind_forecast;
// }

$mysqli -> close();

?>
