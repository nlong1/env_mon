var util = require('util')
var nodeimu = require('./index.js');
var IMU = new nodeimu.IMU();
var request = require('request');
var fs = require('fs');
var ini = require('ini');
var config = ini.parse(fs.readFileSync('../config.ini', 'utf-8'));
var minutes = .5,
    interval = minutes * 60 * 1000;
var temp_skew = parseInt(config.temperatures.skew);
var secret_key = config.env.secret_key;
var server_api_endpoint = config.env.server_api_endpoint;

setInterval(function() {
    console.log("running sensor update job");
    var data = IMU.getValueSync();
    var tempF = data.temperature * 1.8 + 32 + temp_skew;
    var pressureHg = data.pressure * 0.0295300;
    request.post(server_api_endpoint + '?secret_key=' + secret_key, {
            json: {
                temperature: tempF.toFixed(2),
                pressure: pressureHg.toFixed(2),
                humidity: data.humidity.toFixed(2)
            }
        },
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            } else {
                console.log(error);
            }
        }
    );
}, interval);
