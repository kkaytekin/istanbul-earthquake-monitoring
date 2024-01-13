import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));


const app = express();
const port = 3000;

__dirname


// API Parameters
const API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const format = 'geojson';
const startTime = '2022-01-01';
const lat = '41';
const lon = '29';
const radius = '200';

app.use(express.static("public"));

function reformatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    const formattedTime = `${year}-${month}-${dayOfMonth} ${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
    return formattedTime;
}


function preprocessEarthquakeData(data) {
    const earthquakes = data.features;
    const earthquakeData = [];
    for (let i = 0; i < earthquakes.length; i++) {
        const earthquake = earthquakes[i];
        const earthquakeProperties = earthquake.properties;
        const earthquakeGeometry = earthquake.geometry;
        const earthquakeCoordinates = earthquakeGeometry.coordinates;
        const earthquakeLongitude = earthquakeCoordinates[0];
        const earthquakeLatitude = earthquakeCoordinates[1];
        const earthquakeLocation = earthquakeCoordinates[1] + ", " + earthquakeCoordinates[0];
        const earthquakeMagnitude = earthquakeProperties.mag;
        const earthquakePlace = earthquakeProperties.place;
        const earthquakeTime = reformatTime(earthquakeProperties.time);
        const earthquakeDataPoint = {
            latitude: earthquakeLatitude,
            longitude: earthquakeLongitude,
            location: earthquakeLocation,
            magnitude: earthquakeMagnitude,
            place: earthquakePlace,
            time: earthquakeTime
        };
        earthquakeData.push(earthquakeDataPoint);
    }
    return earthquakeData;
}


app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}?format=${format}&starttime=${startTime}&latitude=${lat}&longitude=${lon}&maxradiuskm=${radius}`);
        const earthquakeData = preprocessEarthquakeData(response.data);
        // console.log(earthquakeData);
        console.log(__dirname);
        res.render("map_view.ejs", { data: earthquakeData,
        since: startTime,
        dirname, __dirname});

        // res.sendFile(__dirname + "/views/temp.html");
    } catch (error) {
        console.error(error.response.data);
    }
});

app.listen(port, () => {
    console.log(`Server running on port${port}`);
});