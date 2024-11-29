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
$requestedDate = new DateTime($dateParam, new \DateTimeZone("UTC"));

$todayDate = new DateTime("now", new \DateTimeZone("UTC"));

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

// Initialize cookie file with an absolute path
$cookieFile = __DIR__ . "/cookies.txt";

// Authenticate and store cookies
$authCurl = curl_init("https://www.space-track.org/ajaxauth/login");
curl_setopt($authCurl, CURLOPT_POSTFIELDS, $credentials);
curl_setopt($authCurl, CURLOPT_COOKIEJAR, $cookieFile); // Ensure cookies are saved
curl_setopt($authCurl, CURLOPT_RETURNTRANSFER, 1);
$authData = curl_exec($authCurl);

if (!curl_errno($authCurl)) {
    curl_close($authCurl);
    if (!$cachedData || $clearTodayCache) { //if not in cache, or if we want to recache today's results, get from space-track.org
        // call space-track with auth and query in one step
        $queryUrl = "https://www.space-track.org/basicspacedata/query/class/tle/NORAD_CAT_ID/25544/EPOCH/%3E" . $dateParam . "%2000:00:00,%3C" . $dateParam . "%2023:59:59/orderby/EPOCH%20desc/limit/100/emptyresult/show";
        
        // Separate query request using stored cookies
        $queryCurl = curl_init($queryUrl);
        curl_setopt($queryCurl, CURLOPT_COOKIEFILE, $cookieFile);
        curl_setopt($queryCurl, CURLOPT_RETURNTRANSFER, 1);
        // Add User-Agent header
        curl_setopt($queryCurl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
        // Enable verbose output
        curl_setopt($queryCurl, CURLOPT_VERBOSE, true);
        
        $data = curl_exec($queryCurl);

        // if no error and the data doesn't start with <html (indicating an error page), continue
        if (!curl_errno($queryCurl) && substr($data, 0, 6) != "\n<html") {
          echo $data;
            curl_close($queryCurl);
            $dataArray = json_decode($data, true);
            if (is_array($dataArray) && count($dataArray) > 0) { //if JSON returned isn't empty (can happen when no TLE is available for today yet)
                //save to cache folder
                file_put_contents("./data_cache/" . $cacheFilename, $data);
                //return JSON
                echo ($data);
            } else { //return yesterday's data because today is empty
                //subtract one day from date param
                $tempDT = DateTime::createFromFormat('Y-m-d', $dateParam);
                $yesterdayDT = $tempDT->sub(new DateInterval('P1D'));
                //Get the date in a YYYY-MM-DD format.
                $yesterday = $yesterdayDT->format('Y-m-d');

                //check for cache of yesterday
                $cacheFilename = $yesterday . '.json';
                $cachedData2 = @file_get_contents("./data_cache/" . $cacheFilename);
                if (!$cachedData2) { //if no cache from yesterday then get it and cache it
                    $queryUrl = "https://www.space-track.org/basicspacedata/query/class/tle/NORAD_CAT_ID/25544/EPOCH/%3E" . $yesterday . "%2000:00:00,%3C" . $yesterday . "%2023:59:59/orderby/EPOCH%20desc/limit/100/emptyresult/show";
                    

                    // Separate query request using stored cookies
                    $queryCurl2 = curl_init($queryUrl);
                    curl_setopt($queryCurl2, CURLOPT_COOKIEFILE, $cookieFile);
                    curl_setopt($queryCurl2, CURLOPT_RETURNTRANSFER, 1);
                    // Add User-Agent header
                    curl_setopt($queryCurl2, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
                    $data2 = curl_exec($queryCurl2);

                    if (!curl_errno($queryCurl2)) {
                        curl_close($queryCurl2);
                        //save to cache folder
                        file_put_contents("./data_cache/" . $cacheFilename, $data2);
                        //return JSON
                        echo ($data2);
                    } else {
                        echo "{'error': '" . curl_error($queryCurl2) . "'}";                        
                        curl_close($queryCurl2);
                    }
                } else {
                    echo $cachedData2;
                }
            }

        } else {
            echo "{'error': '" . curl_error($queryCurl) . "'}";
            echo "queryUrl: " . $queryUrl;
            echo $data;
            curl_close($queryCurl);
        }
    } else {
        echo ($cachedData);
    }
} else {
    echo "{'error': '" . curl_error($authCurl) . "'}";
    curl_close($authCurl);
}
