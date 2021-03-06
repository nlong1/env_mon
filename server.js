var fs = require('fs');
var ini = require('ini');
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var server_port = config.env.server_port;
var db_address = config.env.db_address;
var secret_key = config.env.secret_key;


var express = require('express');
var app = express(); // create our app w/ express
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

mongoose.connect(db_address);

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(express.static('public'));

app.listen(server_port);
console.log("App listening on port 8081");

function handler(req, res) {
    fs.readFile(__dirname + "/index.html",
        function(err, data) {
            res.writeHead(200);
            res.end(data);
        });
}

var SenseEntry = mongoose.model('senseentries', {
    created: Date,
    temperature: Number,
    humidity: Number,
    pressure: Number
});

var SenseEntryArchive = mongoose.model('senseentries_archive', {
    created: Date,
    temperature: Number,
    humidity: Number,
    pressure: Number
});

app.get('/api/sense_entries', function(req, res) {

    SenseEntry.find(function(err, sense_entries) {
        if (err)
            res.send(err)

        res.json(sense_entries);
    }).sort('-created').limit(10);
});

app.get('/api/sense_entries_graph', function(req, res) {

    SenseEntryArchive.aggregate([
        { "$group": {
            "_id": {
                "year": { "$year": "$created" },
                "month": { "$month": "$created" },
                "day": { "$dayOfMonth": "$created" },
                "dayOfYear": { "$dayOfYear": "$created" },
                "hour": {         
                    "$subtract": [
                    { "$hour": "$created" },
                    { "$mod": [{ "$hour": "$created" }, 1 ] }
                    ]
                }
            },
            "avg_temp": { "$avg": "$temperature" },
            "avg_humidity": { "$avg": "$humidity" },
            "avg_pressure": { "$avg": "$pressure" },
        }},
        { "$sort": { "_id": -1 } },
        ], function(err, sense_entries_graph) { 

            if (err) { res.send(err) }
            var total = sense_entries_graph.length;
            var created = [];
            var temp = [];
            var humidity = [];
            var pressure = [];
            for (i = 0; i < total; i++) {
                created_str = String(sense_entries_graph[i]._id.year) + "-" + String(sense_entries_graph[i]._id.month) + "-" + String(sense_entries_graph[i]._id.day) + ' Hour: ' + String(sense_entries_graph[i]._id.hour);
                created.push(created_str);
                temp.push(parseFloat(sense_entries_graph[i].avg_temp).toFixed(1));
                humidity.push(parseFloat(sense_entries_graph[i].avg_humidity).toFixed(1));
                pressure.push(parseFloat(sense_entries_graph[i].avg_pressure).toFixed(1));
            }
            sense_entries_graph = [created, temp, humidity, pressure];

            res.json(sense_entries_graph);
    });
});

app.post('/api/sense_entries', function(req, res) {

    if (req.query.secret_key == secret_key) {
        SenseEntry.create({
            created: new Date(),
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            pressure: req.body.pressure
        }, function(err, sense_entry) {
            if (err)
                res.send(err);

            res.json({});
        });

        SenseEntryArchive.create({
            created: new Date(),
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            pressure: req.body.pressure
        }, function(err, sense_entry) {});
    } else {
        res.status(404).send('Not found');
    }
});


app.get('*', function(req, res) {
    res.send('./public/index.html');
});
