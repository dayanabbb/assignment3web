const express = require('express');
const https = require('https');
const path = require('path');
const bcrypt = require('bcrypt');
const userCollection = require('./src/db');

const app = express();

//api keys
const googleMapsApiKey = 'AIzaSyASim_qRRpD6DzwLV3vSmAb8VNajCcWzJo';
const nasaApiKey = 'dbXXfS9EwCtDkpK224fYAiqreiNLy2aXQJcdsECQ';
const openWeatherApiKey = '67f9691854657c1c5e8f7c2918fb60b1';



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = 3000;

app.set('view engine', 'ejs');



app.get("/", function(req, res) {
    res.redirect("/login");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

//Sign up
app.post("/signup", async function(req, res) {
    try {
        const data = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        };

        //If Exist
        const existingUser = await userCollection.findOne({username: req.body.username});
        if(existingUser){
            console.lof(existingUser)
            res.send("User already exists!")
        }else{
            const userData = await userCollection.insertMany([data]);
            console.log(userData)
            res.status(201).send("User created successfully");
            
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// Login
app.post("/login", async function(req, res) {
    try{
        const user = await userCollection.findOne({username: req.body.username, password: req.body.password});
            if(!user){
            res.send("Invalid Password of Username");
        }else{
                if (user.username === "Dayana" && user.password === "123abc") {
                    res.render('admin');
                } else {
                    res.render('user');
                }
        }
    }catch(error){
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//Delete
app.post("/admin", async function(req, res) {
    try {
        const userEmail = req.body.email;
        const existingUser = await userCollection.findOne({ email: userEmail });
        
        if (existingUser) {
            await userCollection.deleteOne({ email: userEmail });
            console.log(req.body);
            res.send(`User with email ${userEmail} deleted successfully`);
        } else {
            res.send("User not found");
            console.log(existingUser);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/location", function(req, res) {
    const query = req.query.city;
    const mapUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${googleMapsApiKey}`;

    https.get(mapUrl, function(response) {
        let data = "";
        response.on("data", function(chunk) {
            data += chunk;
        });

        response.on("end", function() {
            const locationData = JSON.parse(data);
            const location = locationData.results[0].geometry.location;

            res.send({
                latitude: location.lat,
                longitude: location.lng
            });
        });
    });
});

app.get("/extra-data", function(req, res) {
    const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`;

    https.get(nasaApiUrl, function(response) {
        let data = "";
        response.on("data", function(chunk) {
            data += chunk;
        });

        response.on("end", function() {
            const nasaData = JSON.parse(data);
            res.send({
                nasaData: nasaData
            });
        });
    });
});

app.get("/weather", function(req, res) {
    const query = req.query.city;
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${openWeatherApiKey}&units=${unit}`;
    
    https.get(url, function(response) {
        let data = "";
        response.on("data", function(chunk) {
            data += chunk;
        });

        response.on("end", function() {
            const weatherData = JSON.parse(data);
            const { name: cityName, main: { temp, feels_like: feels, humidity, pressure }, weather: [{ description, icon }], wind: { speed }, cod, coord: { lon, lat } } = weatherData;
            const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            res.render("weather", {
                cityName,
                code: cod,
                lon,
                lat,
                temp,
                description,
                feels,
                humidity,
                wind: speed,
                pressure,
                imageURL,
                apiKey: googleMapsApiKey
            });
        });
    });
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});