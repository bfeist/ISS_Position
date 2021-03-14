<?php

// credentials.php sets $credentials variable in the format 'identity=<username>&password=<password>';
// create account at space-track.org
require 'credentials.php';

header('Content-Type: application/json');
if (!isset($_GET['date'])) {
    echo "{'error': 'need date parameter. eg ?date=2021-03-14'}";
    exit();
}

$dateParam = $_GET['date'];
if (!preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $dateParam)) { //check if valid yyyy-mm-dd string
    echo "{'error': 'bad date format'}";
    exit();
}
$requestedDate = new DateTime($dateParam);
$requestedDate->setTimezone(new DateTimeZone('GMT'));

$todayDate = new DateTime();
$todayDate->setTimezone(new DateTimeZone('GMT'));

//check if in the future
if ($requestedDate > $todayDate) {
    echo "{'error': 'can\'t predict future'}";
    exit();
}

$cacheFilename = $dateParam . '.json';

//check if date param is today. If it is, use today.json cache file and refresh it if > 1 hour old.
$clearTodayCache = false;
$interval = $todayDate->diff($requestedDate);
if ($interval->days == 0) { //if today implement incremental caching
    $cacheFilename = 'today.json';
    if (time()-@filemtime("./data_cache/" . $cacheFilename) > 3600) { //if cache older that 1 hour, recache from API
        $clearTodayCache = true;
    }
}

//check if date requested already in cache, if so, read it and return it
$cachedData = @file_get_contents("./data_cache/" . $cacheFilename);
if (!$cachedData || $clearTodayCache) { //if not in cache, or if we want to recache today's results, get from space-track.org
    // call space-track with auth and query in one step
    $queryUrl = "https://www.space-track.org/basicspacedata/query/class/tle/NORAD_CAT_ID/25544/EPOCH/>" . $dateParam . "%2000:00:00,<" . $dateParam . "%2023:59:59/orderby/EPOCH desc/limit/100/emptyresult/show";
    $curl = curl_init("https://www.space-track.org/ajaxauth/login");
    curl_setopt($curl, CURLOPT_POSTFIELDS, $credentials . '&query=' . $queryUrl);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $data = curl_exec($curl);

    if (!curl_errno($curl)) {
        //save to cache folder
        file_put_contents("./data_cache/" . $cacheFilename, $data);

        //return JSON call
        echo ($data);

    } else {
        echo "{'error': '" . curl_error($curl) . "'}";
    }
    curl_close($curl);
} else {
    echo ($cachedData);
}
