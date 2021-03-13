/**
 * Application entry point
 */

// Load application styles
import "scss/_index.scss";

// ================================
// START YOUR APP HERE
// ================================

console.log("test");

// import * as L from "leaflet";
// var mymap = L.map("mapid").setView([51.505, -0.09], 13);
// mymap.addLayer(
//     L.mapbox.styleLayer("mapbox://styles/bfeist/ckm6vcsb83seh17m7pdwb90qk")
// );
// L.tileLayer(
//     "https://api.mapbox.com/styles/bfeist/ckm6vcsb83seh17m7pdwb90qk/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmZlaXN0IiwiYSI6ImNpbDJva2hseTNnZnd1Z20zNmU0cDExdXUifQ.3acQyDaKU1HS8k5hqPmp1w",
//     {
//         maxZoom: 18,
//         attribution:
//             'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
//             'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//         id: "mapbox/streets-v11",
//         tileSize: 512,
//         zoomOffset: -1,
//     }
// ).addTo(mymap);
// mapbox://styles/bfeist/ckm6vcsb83seh17m7pdwb90qk

import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

mapboxgl.accessToken =
    "pk.eyJ1IjoiYmZlaXN0IiwiYSI6ImNpbDJva2hseTNnZnd1Z20zNmU0cDExdXUifQ.3acQyDaKU1HS8k5hqPmp1w";

const map = new mapboxgl.Map({
    container: "map", // container ID
    // style: "mapbox://styles/bfeist/ckm6vcsb83seh17m7pdwb90qk", // style URL for topo
    style: "mapbox://styles/bfeist/ckm6yjob22j6b17o79mq0tvr7", // satellite
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 4, // starting zoom
});

const interval = setInterval(() => {
    let curCenter = map.getCenter();
    let newLng = (curCenter.lng += 0.02);
    let newLat = curCenter.lat;
    newLng += 0.02;
    const newCenter = { lng: newLng, lat: newLat };
    console.log(newCenter);
    const map2 = map.setCenter(newCenter);
}, 1000);
