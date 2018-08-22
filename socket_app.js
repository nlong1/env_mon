"use strict";
var fs = require('fs');
var ini = require('ini');
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
var db_address = config.env.db_address;
var socket_port = config.env.socket_port;

var mongo = require("mongodb"),
    fs = require("fs"),         // to read static files
    io = require("socket.io"),  // socket io server
    http = require("http");

var mongodbUri = db_address;

var app = http.createServer(handler);
io = io.listen(app);
app.listen(socket_port);
console.log("http server on port " + socket_port);


function handler(req, res){
  fs.readFile(__dirname + "/index.html",
  function (err, data) {
    res.writeHead(200);
    res.end(data);
  });
}

mongo.MongoClient.connect(mongodbUri, function (err, db) {
  db.collection('senseentries', function(err, collection) {
    // open socket
    io.sockets.on('connection', function (socket) {
      // open a tailable cursor
      console.log("= open tailable cursor");
      collection.find({}, { tailable:true, awaitdata:true, numberOfRetries:-1 }).each(function(err, doc) {
        // send message to client
        socket.emit("senseentries_evt",doc);
      })
    });
  });
});
