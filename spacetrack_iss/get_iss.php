<?php

header('Content-Type: application/json');
if (isset($_GET['date'])) {
    $dateParam = $_GET['date']; //yyyy-mm-dd
    if (preg_match("/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/", $dateParam)) { //check if valid date string

        //check if date param is today. If it is, use yesterday's data

        //check if date requested already in cache, if so, read it and return it
        $cacheFilename = $dateParam . '.json';
        $cachedData = @file_get_contents("./data_cache/" . $cacheFilename);
        if (!$cachedData) {
            //not in cache, get from space-track.org

            // call space-track with auth and query in one step
            $queryUrl = "https://www.space-track.org/basicspacedata/query/class/tle/NORAD_CAT_ID/25544/EPOCH/>" . $dateParam . "%2000:00:00,<" . $dateParam . "%2023:59:59/orderby/EPOCH desc/limit/100/emptyresult/show";
            $curl = curl_init("https://www.space-track.org/ajaxauth/login");
            curl_setopt($curl, CURLOPT_POSTFIELDS, 'identity=bf@benfeist.com&password=oX3kI0qA1yC8yE6h&query=' . $queryUrl);
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

    } else {
        echo "{'error': 'bad date'}";
    }
} else {
    echo "{'error': 'bad date'}";
}
