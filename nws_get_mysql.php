<?php

/*
*
*  Gets the wind data json in MySQL table, returns it as json to javascript
*
*/

// display errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// connect to database
include 'db_mysqli.php';

// get variables from AJAX
$gridX = $_POST['gridX'];
$gridY = $_POST['gridY'];
$station = $_POST['station'];

// $gridX = 84;
// $gridY = 122;
// $station = "MTR";

// Perform query
if ($result = $mysqli -> query("SELECT json_wind FROM weather_forecast WHERE gridX = '$gridX' AND gridY = '$gridY' LIMIT 1")) {
    while($row = mysqli_fetch_assoc($result)) {
      // $json[] = $row;
      $json_wind = $row["json_wind"];
      // $date_updated = $row["date_updated"];
      echo $json_wind;  // this is returned to weatheralert.js
     }
     // echo json_encode($json);
}

// close connection to MySQL
$mysqli -> close();

?>
