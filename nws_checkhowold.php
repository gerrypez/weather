<?php

/*
*
*  This checks out old the most recent date is in the Wind table
*
*/

// display errors
ini_set("allow_url_fopen", 1);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// connect to database
include 'db_mysqli.php';

// get current local time
date_default_timezone_set('America/Los_Angeles');
$datetime_now = date('Y-m-d H:i:s');

global $mysqli;
$query = "SELECT write_date FROM weather_forecast ORDER BY write_date DESC LIMIT 1";
$result = $mysqli->query($query);
while($row = $result->fetch_assoc()) {

    $datetime1 = new DateTime($row['write_date']);//start time
    $datetime2 = new DateTime($datetime_now);//end time
    $interval = $datetime1->diff($datetime2);

    // echo $interval->format('%Y years %m months %d days %H hours %i minutes %s seconds');//00 years 0 months 0 days 08 hours 0 minutes 0 seconds

    // number of hours from latest update
    echo $interval->format('%h');

}

