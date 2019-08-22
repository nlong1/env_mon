var MongoClient = require('mongodb').MongoClient;
var nodemailer = require('nodemailer');
var fs = require('fs');
var ini = require('ini');
var config = ini.parse(fs.readFileSync('/home/pi/env_mon/config.ini', 'utf-8'))
var email_address, email_addresses = config.email_addresses.array;
var from_email = config.email_addresses.from_email;
var smtp_host = config.env.smtp_host;
var smtp_port = config.env.smtp_port;
var max_temp = config.temperatures.maximum;
var min_temp = config.temperatures.minimum;
var db_address = config.env.db_address;

       
MongoClient.connect(db_address, function(err, db) {
    var dbo = db.db("env_mon");
    dbo.collection("senseentries_archives").find().sort({"created": -1}).limit(1).toArray(function(err, result) {
	    var temperature = result[0].temperature
	
        if (temperature >= max_temp || temperature <= min_temp) {
            var rounded_temp = Math.round(temperature)
            var subject  = `Lawrence Temp Alert: ${rounded_temp} Degrees`;
            var message = `The temperature in the Lawrence OIT area is ${rounded_temp} degrees.`;
            var transOptions = {
                host: smtp_host,
                port: parseInt(smtp_port),
                secure: false,
                igonreTLS: true
            };
            var transporter = nodemailer.createTransport(transOptions);

            for (email_address of email_addresses) {
                var mainOptions = {
                    from: from_email,
                    to: email_address,
                    subject: subject,
                    text: message
                };
                transporter.sendMail(mainOptions);
            }
       	}    
    });
    db.close();
});


