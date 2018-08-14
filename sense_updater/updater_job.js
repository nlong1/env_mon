var util = require('util')
var nodeimu  = require('./index.js');
var IMU = new nodeimu.IMU();
var request = require('request');

var minutes = 1, interval = minutes * 60 * 1000;
//var interval = 30000;
setInterval(function() {
  console.log("running sensor update job");
  var data = IMU.getValueSync();
  var tempF = data.temperature + 1.8 + 32;
  var pressureHg = data.pressure * 29.92 / 1013.25;
  request.post('http://localhost:8080/api/sense_entries',
    { json: { temperature: tempF.toFixed(2),
			  pressure: pressureHg.toFixed(2),
			  humidity: data.humidity.toFixed(2) } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}, interval);
