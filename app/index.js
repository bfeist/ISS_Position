const {
    getLatLngObj,
    getEpochTimestamp,
    getSatelliteInfo,
    getFirstTimeDerivative,
    getSecondTimeDerivative,
    getBstarDrag,
    getEccentricity,
} = require("tle.js/dist/tlejs.cjs");
import "scss/_index.scss";
import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

mapboxgl.accessToken = "pk.eyJ1IjoiYmZlaXN0IiwiYSI6ImNpbDJva2hseTNnZnd1Z20zNmU0cDExdXUifQ.3acQyDaKU1HS8k5hqPmp1w";

//just need any location for getSatelliteInfo
const houstonLatLng = {
    lng: 95.3698,
    lat: 29.7604,
};

// create Mapbox map object
const map = new mapboxgl.Map({
    container: "map", // container ID
    // style: "mapbox://styles/bfeist/ckm6vcsb83seh17m7pdwb90qk", // style URL for topo
    style: "mapbox://styles/bfeist/ckm6yjob22j6b17o79mq0tvr7", // satellite
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 2, // starting zoom
    attributionControl: false,
    antialias: true,
});

// Main section that depends on await fetch of ephemeris
(async () => {
    //date to get TLE for
    const t = new Date();
    const dateToFetch = t.toISOString().split("T")[0];

    const tle_data = await fetchIssTle(dateToFetch);

    const timestampWanted = new Date(); //now

    let thisDateDiff;
    let lastDateDiff = -1;
    let mostRecentTLE = "";
    // chew through ephemiris data looking for the most recent TLE for the timestamp of interest
    for (let i = 0; i < tle_data.length; i++) {
        // console.log(`${i} ${new Date(tle_data[i].EPOCH + "Z").toUTCString()}`);
        thisDateDiff = new Date(tle_data[i].EPOCH) - timestampWanted;
        if (i !== 0 && Math.abs(thisDateDiff) > Math.abs(lastDateDiff)) {
            // we have passed the TLE epoch closest to the wanted date (before the wanted date)
            const tleObj = tle_data[i - 1];
            mostRecentTLE = `${tleObj.TLE_LINE0}
                ${tleObj.TLE_LINE1}
                ${tleObj.TLE_LINE2}`;
            break;
        }
        lastDateDiff = thisDateDiff;
    }

    //calculate lat long for timestamp of interest using mostRecentTLE as orbital starting point
    const latLonObj = getLatLngObj(mostRecentTLE, timestampWanted);
    map.setCenter(latLonObj);
    console.log(latLonObj);

    var el = document.createElement("div");
    el.className = "marker";
    const marker = new mapboxgl.Marker(el).setLngLat(latLonObj).addTo(map);

    const epochTime = new Date(getEpochTimestamp(mostRecentTLE));

    document.getElementById("ephem").innerHTML = displayDateMs(epochTime);
    document.getElementById("mean1").innerHTML = getFirstTimeDerivative(mostRecentTLE);
    document.getElementById("mean2").innerHTML = getSecondTimeDerivative(mostRecentTLE);
    document.getElementById("bstar").innerHTML = getBstarDrag(mostRecentTLE);
    document.getElementById("eccen").innerHTML = getEccentricity(mostRecentTLE);

    const interval = setInterval(() => {
        // const t = new Date("2021-03-13T04:30:00Z"); //now
        const t = new Date(); //now
        const latLonObj = getLatLngObj(mostRecentTLE, t.getTime());
        marker.setLngLat(latLonObj);

        const satInfo = getSatelliteInfo(
            mostRecentTLE, // Satellite TLE string or array.
            t.getTime(), // Timestamp (ms)
            houstonLatLng.lat, // Observer latitude (degrees)
            houstonLatLng.lng, // Observer longitude (degrees)
            0 // Observer elevation (km)
        );

        document.getElementById("selTimestamp").innerHTML = displayDateMs(t);

        document.getElementById("selLat").innerHTML = `${latLonObj.lat.toString().substr(0, 16)}`;
        document.getElementById("selLng").innerHTML = `${latLonObj.lng.toString().substr(0, 16)}`;

        document.getElementById("alt").innerHTML = `${satInfo.height.toString().substr(0, 16)} km`;
        document.getElementById("velkms").innerHTML = `${satInfo.velocity.toString().substr(0, 15)} km/s`;
        document.getElementById("velkmh").innerHTML = `${(satInfo.velocity * 3600).toString().substr(0, 15)} km/h`;
        document.getElementById("velmph").innerHTML = `${(satInfo.velocity * 2236.94).toString().substr(0, 15)} mph`;
    }, 10);

    const interval2 = setInterval(() => {
        const timestampWanted = new Date(); //now
        const latLonObj = getLatLngObj(mostRecentTLE, timestampWanted.getTime());
        map.setCenter(latLonObj);
    }, 5000);
})();

/**
 * TLE json is sorted descending by EPOCH (date of TLE)
 * loop through TLEs looking for when the date diff between now and the epoch gets larger, this means the last one we checked was the nearest to the time we want.
 * */
async function fetchIssTle(dateToFetch) {
    // const response = await fetch("/assets/iss_tle.json");
    // const response = await fetch("http://coda-data.apolloinrealtime.org/iss_tle.json");
    const response = await fetch(
        "http://coda-data.apolloinrealtime.org/spacetrack_iss/get_iss.php?date=" + dateToFetch
    );
    const tle_data = response.json();
    return tle_data;
}

function padZeros(num, size) {
    let s = num.toString();
    return s.padStart(2, "0");
}

function displayDateMs(d) {
    return (
        d.getUTCFullYear() +
        "-" +
        padZeros(d.getUTCMonth() + 1, 2) +
        "-" +
        d.getUTCDate() +
        " " +
        padZeros(d.getUTCHours(), 2) +
        ":" +
        padZeros(d.getUTCMinutes(), 2) +
        ":" +
        padZeros(d.getUTCSeconds(), 2) +
        "." +
        d.getMilliseconds()
    );
}
