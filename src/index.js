import {
  getLatLngObj,
  getEpochTimestamp,
  getSatelliteInfo,
  getFirstTimeDerivative,
  getSecondTimeDerivative,
  getBstarDrag,
  getEccentricity,
} from "tle.js";
import "./styles/scss/_index.scss";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
  /**
   * loop through TLEs looking for when the date diff between now and the epoch gets larger, this means the last one we checked was the nearest to the time we want.
   */

  for (let i = 0; i < tle_data.length; i++) {
    thisDateDiff = new Date(tle_data[i].EPOCH) - timestampWanted;
    const tleObj = tle_data[i];
    if (lastDateDiff === -1 || thisDateDiff <= lastDateDiff) {
      mostRecentTLE = `${tleObj.TLE_LINE0}
                ${tleObj.TLE_LINE1}
                ${tleObj.TLE_LINE2}`;
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

  function updateSatellitePosition() {
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

    requestAnimationFrame(updateSatellitePosition);
  }
  updateSatellitePosition();

  const interval2 = setInterval(() => {
    const timestampWanted = new Date(); //now
    const latLonObj = getLatLngObj(mostRecentTLE, timestampWanted.getTime());
    map.setCenter(latLonObj);
  }, 5000);
})();

/**
 * TLE json is sorted descending by EPOCH (date of TLE)
 * */
async function fetchIssTle(dateToFetch) {
  const urlBase = import.meta.env.VITE_SPACETRACK_ISS_API_URL;
  const response = await fetch(`${urlBase}?date=${dateToFetch}`);
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
