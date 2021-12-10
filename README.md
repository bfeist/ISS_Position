ISS Temporal Groundtrack
===========
![npm](https://img.shields.io/npm/v/mapbox-gl?label=mapbox-gl&style=flat-square&logo=webpack)
![npm](https://img.shields.io/npm/v/tle.js?label=tle.js&style=flat-square&logo=webpack)

![npm](https://img.shields.io/badge/dependencies-up--to--date-green?style=flat-square&logo=npm&color=success)

> A prototype that displays the current location of the International Space Station (ISS) on a Mapbox map and continuously updates it.

Built to be stood up quickly under VSCode using Node.

The `spacetrack_iss` folder contains a simple PHP `space-track.org` API caching scheme. This app hits the API for ISS TLE ephemeris JSON objects for a given day and caches the response. This is decoupled from the rest of the code in this repo. Run it in an environment of your choice that has PHP curl capability. Put the location URL into the `index.js` file.

[TLE](https://en.wikipedia.org/wiki/Two-line_element_set) data is processed using `tle.js` library into orbital data including latitude and longitude. This data is fed into `mapbox-gl` on an interval to update the ISS position every 100th of a second, and recenter the map every 5 seconds. 

# Accounts Needed for External APIs
## Mapbox
[Mapbox](https://www.mapbox.com/) is the service that provides the map itself upon which the ISS groundtrack position is indicated.

Get your MapBox API key and create a`src/credentials.js` file with one line in it:
```javascript  
mapboxCredentials = "<mapboxkey>";
```

## Space-Track

[Space-Track](https://space-track.org) provides us with orbital ephemeris data that allows us to calculate the current position of the ISS very accurately.

Get your Space-track user account and create a `spacetrack_iss/credentials.php` file with two lines in it:  
```PHP
<? php
`$credentials = 'identity=<username>&password=<password>';
```

# Environment
## Install
`$ npm install`

## Run
`$ npm run dev`  
Access via `http://localhost:3000/`

## Build
`$ npm run build`  
Copy contents of `/dist` folder to external server