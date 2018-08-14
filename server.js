var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var secret_key = 'some_secret_key'

mongoose.connect('mongodb://localhost/env_mon');

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(express.static('public'));

app.listen(8080);
console.log("App listening on port 8080");

function handler(req, res){
  fs.readFile(__dirname + "/index.html",
  function (err, data) {
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

  SenseEntryArchive.find(function(err, sense_entries_graph) {
    if (err)
      res.send(err)
    var total = sense_entries_graph.length;
	var created = [];
	var temp = [];
	var humidity = [];
	var pressure = [];
	for (i = 0; i < total; i++) {
		created.push(sense_entries_graph[i].created.toUTCString());
		temp.push(sense_entries_graph[i].temperature);
		humidity.push(sense_entries_graph[i].humidity);
		pressure.push(sense_entries_graph[i].pressure);
	}
	sense_entries_graph = [created, temp, humidity, pressure];
	
    res.json(sense_entries_graph);
	// map res to model for n3-charts here
  }).sort('created');
});

app.post('/api/sense_entries', function(req, res) {

  if (req.query.secret_key == secret_key) {
    SenseEntry.create({
      created : new Date(),
      temperature : req.body.temperature,
      humidity : req.body.humidity,
      pressure : req.body.pressure
    }, function(err, sense_entry) {
      if (err)
        res.send(err);
	    
      res.json({});
    });
  
    SenseEntryArchive.create({
      created : new Date(),
      temperature : req.body.temperature,
      humidity : req.body.humidity,
      pressure : req.body.pressure
    }, function(err, sense_entry) {});
  } 
  else {
    res.status(404).send('Not found');
  }
});


app.get('*', function(req,res) {
  res.send('./public/index.html');
});
