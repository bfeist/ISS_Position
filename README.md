CODA ISS Temporal Groundtrack
===========
![npm](https://img.shields.io/npm/v/mapbox-gl?label=mapbox-gl&style=flat-square&logo=webpack)
![npm](https://img.shields.io/npm/v/tle.js?label=tle.js&style=flat-square&logo=webpack)

![npm](https://img.shields.io/badge/dependencies-up--to--date-green?style=flat-square&logo=npm&color=success)

> A prototype that displays the current location of the ISS on a Mapbox map and continuously updates it.

Built to be stood up quickly under VSCode.

## API accounts
[Mapbox](https://www.mapbox.com/) access key (add to `index.js`)

Space-track.org user account (add to `spacetrack_iss/credentials.php`)

## Run
$ npm run dev

## Build
$ npm run build

Copy contents of `/dist` folder to external server

## Notes
The `spacetrack_iss` folder contains a simple PHP `space-track.org` API caching scheme. This app hits the API for ISS TLE ephemeris JSON objects for a given day and caches the response. This is decoupled from the rest of the code in this repo. Run it in an environment of your choice that has PHP curl capability. Put the location URL into the `index.js` file.

[TLE](https://en.wikipedia.org/wiki/Two-line_element_set) data is processed using `tle.js` library into orbital data including latitude and longitude. This data is fed into `mapbox-gl` on an internal to update the ISS position every 100th of a second, and recenter the map every 5 seconds. 