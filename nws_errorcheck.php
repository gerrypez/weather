<?php

/*
*
*  This is general Error Check script looking for errors in the MySQL table (ex. out of date fields)
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


/*
*
*  Check site, station, grid matches
*
*/
function variableMatch ($site, $station, $gridX, $gridY) {
    global $mysqli;
    $query1 = "SELECT site, station, gridX, gridY FROM weather_forecast WHERE site = '$site'";
    $result = $mysqli->query($query1);
    $row_cnt = $result->num_rows;
    // make sure site is in database
    if ($row_cnt == 0) {
        echo("E. [vatiableMatch] can not find ".$site." in database");
    }
    // look for matching error
    while($row = $result->fetch_assoc()) {

        if ($station != $row["station"]) {
            echo ("variableMatch error ".$site." station ".$station."<br>");
        }

        if ($gridX != $row["gridX"]) {
            echo ("variableMatch error ".$site." gridX ".$gridX."<br>");
        }

        if ($gridY != $row["gridY"]) {
            echo ("variableMatch error ".$site." gridY ".$gridY."<br>");
        }

    }
}


/*
*
*  Check for site_name duplicates
*
*/
function checkDuplicate () {
    global $mysqli;
    $query1 = "SELECT * FROM weather_forecast GROUP BY site HAVING COUNT(site) > 1";
    $result = $mysqli->query($query1);
    while($row = $result->fetch_assoc()) {
        echo ("E. checkDuplicate error ".$row['site']."<br>");
    }
}
checkDuplicate();

/*
*
*  Find sites not being updated date_update field
*
*/
function checkupdateStamp () {

    $datetime_now = date('Y-m-d H:i:s');
    global $mysqli;
    $query = "SELECT site, write_date FROM weather_forecast";
    $result = $mysqli->query($query);
    while($row = $result->fetch_assoc()) {

        $site = $row['site'];
        $date1 = new DateTime($row['write_date']);
        $date2 = new DateTime($datetime_now);
        $diff = $date2->diff($date1)->format("%a");

        if ($diff > 2) {
            echo ("E. [checkupdateStamp] write_date ".$site." is not updating<br>");
        }
    }
}
checkupdateStamp();

/*
*
*  Find sites not being updated json_wind
*
*/
function checkjsonWind () {

    $datetime_now = date('Y-m-d H:i:s');
    global $mysqli;
    $json_array = array();

    $query = "SELECT site, station, gridX, gridY, json_wind FROM weather_forecast";
    $result = $mysqli->query($query);
    while($row = $result->fetch_array(MYSQLI_ASSOC)) {

        $site = $row['site'];
        $station = $row['station'];
        $gridX = $row['gridX'];
        $gridY = $row['gridY'];

        $json_wind = $row['json_wind'];
        $json_array = json_decode($json_wind, true); // create array

        $mysql_date = $json_array['properties']['updated']; // get updated datetime in json_wind

        $date1 = new DateTime($mysql_date);
        $date2 = new DateTime($datetime_now);
        $diff_hours = $date2->diff($date1)->format("%h");
        $diff_days = $date2->diff($date1)->format("%a");

        if ($diff_days > 2) {
            // echo ($site_is." ".$diff_days."D<br>");
            echo ("E. [checkjsonWind] mysql_date ".$site." ".$diff_days." days old<br>");
        }

        /*
        if ($diff_hours > 8) {
            echo ($site_is." ".$diff_hours."h,<br> ");
        }
        */

    }
}

checkjsonWind();


/*
*
*  lat, lng needs to match station, gridX, gridY
*
*/
function checkLatlng ($site, $station, $gridX, $gridY, $lat, $lng) {

    // get station, gridx and gridy from NWS


        $url = "https://api.weather.gov/points/".$lat.",".$lng;

        $context = stream_context_create(
            array(
                "http" => array(
                    "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                )
            )
        );
        $result = file_get_contents($url, false, $context);

        //call api
        $json = json_decode($result);
        $cwa_api = $json->properties->cwa;
        $gridx_api = $json->properties->gridX;
        $gridy_api= $json->properties->gridY;

        if ($station != $cwa_api || $gridx_api != $gridX || $gridy_api != $gridY) {
            echo ("E ".$site." [checkLatLng]: ".$station."-".$gridX."-".$gridY." should be ".$cwa_api."-".$gridx_api."-".$gridy_api."<br>");
        }

}



$site = "big_sur";
$lat = 35.971;
$lng = -121.453;
$station = "MTR";
$gridX =  103;
$gridY =  19;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "berkeley";
$lat = 37.871;
$lng = -122.319;
$station = "MTR";
$gridX =  89;
$gridY =  109;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "blue_rock";
$lat = 38.1384;
$lng = -122.1959;
$station = "STO";
$gridX =  12;
$gridY =  53;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "channing";
$lat = 38.098;
$lng = -122.180;
$station = "STO";
$gridX =  12;
$gridY =  51;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "channing_east";
$lat = 38.099;
$lng = -122.180;
$station = "STO";
$gridX =  12;
$gridY =  51;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "coloma";
$lat = 38.822;
$lng = -120.889;
$station = "STO";
$gridX =  63;
$gridY =  74;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "crissy";
$lat = 37.7944;
$lng = -122.4559;
$station = "MTR";
$gridX = 84;
$gridY = 106;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "davis";
$lat = 38.570;
$lng = -121.820;
$station = "STO";
$gridX =  29;
$gridY =  69;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "diablo_juniper";
$lat = 37.881;
$lng = -121.914;
$station = "MTR";
$gridX =  103;
$gridY =  106;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "diablo_towers";
$lat = 37.881;
$lng = -121.914;
$station = "MTR";
$gridX =  103;
$gridY =  106;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "dillon";
$lat = 38.0643;
$lng = -122.1981;
$station = "STO";
$gridX = 11;
$gridY = 49;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "drakes";
$lat = 38.0265;
$lng = -122.9634;
$station = "MTR";
$gridX =  68;
$gridY =  120;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "dunlap";
$lat = 36.765;
$lng = -119.098;
$station = "HNX";
$gridX =  77;
$gridY =  96;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "ed_levin";
$lat = 37.475;
$lng = -121.861;
$station = "MTR";
$gridX =  101;
$gridY =  88;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "elk";
$lat = 39.277;
$lng = -122.941;
$station = "EKA";
$gridX =  88;
$gridY =  30;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "goat";
$lat = 38.443;
$lng = -123.122;
$station = "MTR";
$gridX =  66;
$gridY =  140;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "grade";
$lat = 38.478;
$lng = -123.163;
$station = "MTR";
$gridX =  65;
$gridY =  142;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "hat_creek";
$lat = 40.842;
$lng = -121.428;
$station = "STO";
$gridX =  62;
$gridY =  167;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "hull";
$lat = 39.509;
$lng = -122.937;
$station = "EKA";
$gridX =  91;
$gridY =  40;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "indianvalley";
$lat = 40.194;
$lng = -120.923;
$station = "REV";
$gridX =  12;
$gridY =  142;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "lagoonkite";
$lat = 38.333;
$lng = -122.002;
$station = "STO";
$gridX =  20;
$gridY =  60;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "lagoon";
$lat = 38.333;
$lng = -122.002;
$station = "STO";
$gridX =  20;
$gridY =  60;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "musselrock";
$lat = 37.674;
$lng = -122.495;
$station = "MTR";
$gridX =  81;
$gridY =  101;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "musselkite";
$lat = 37.674;
$lng = -122.495;
$station = "MTR";
$gridX =  81;
$gridY =  101;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "mt_tam";
$lat = 37.911;
$lng = -122.625;
$station = "MTR";
$gridX =  79;
$gridY =  113;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "mission";
$lat = 37.518;
$lng = -121.892;
$station = "MTR";
$gridX =  101;
$gridY =  90;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "oroville";
$lat = 39.537;
$lng = -121.628;
$station = "STO";
$gridX =  44;
$gridY =  111;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "poplar";
$lat =  37.4554;
$lng = -122.4447;
$station = "MTR";
$gridX =  81;
$gridY =  91;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "potato";
$lat = 39.3317;
$lng = -122.685;
$station = "STO";
$gridX =  6;
$gridY =  109;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "sandybeach";
$lat =  38.0772;
$lng = -122.2398;
$station = "STO";
$gridX =  10;
$gridY =  50;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "sand_city";
$lat = 36.626;
$lng = -121.844;
$station = "MTR";
$gridX =  95;
$gridY =  51;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "shoreline";
$lat = 37.430;
$lng = -122.076;
$station = "MTR";
$gridX =  94;
$gridY =  88;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "st_helena";
$lat = 38.667;
$lng = -122.628;
$station = "MTR";
$gridX =  86;
$gridY =  146;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "stoneman";
$lat = 38.0047;
$lng = -121.9201;
$station = "MTR";
$gridX =  104;
$gridY =  112;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "tollhouse";
$lat = 37.015;
$lng = -119.373;
$station = "HNX";
$gridX =  69;
$gridY =  109;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "vacaridge";
$lat = 38.400;
$lng = -122.106;
$station = "MTR";
$gridX =  101;
$gridY =  131;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "vallejo";
$lat = 38.1451;
$lng = -122.2649;
$station = "STO";
$gridX =  9;
$gridY =  53;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "waddel";
$lat = 37.089;
$lng = -122.274;
$station = "MTR";
$gridX =  84;
$gridY =  74;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);

$site = "windy";
$lat = 37.364;
$lng = -122.245;
$station = "MTR";
$gridX =  87;
$gridY =  86;
variableMatch ($site, $station, $gridX, $gridY);
checkLatLng ($site, $station, $gridX, $gridY, $lat, $lng);



$mysqli->close();




?>
