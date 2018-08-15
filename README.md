# env_mon

-Bare RPi Installation-
install node 4.6.0

sudo apt-get install sense-hat

sudo apt-get install mongodb

start mongod (& add to init?)

(Create capped collection)

mongo

use env_mon

db.createCollection("senseentries", { capped: true, size: 5242880 } )

db.senseentries.find().addOption(2).addOption(32)


git clone <this repo>

cd env_mon

npm install

<fix urls in index.html to point at socket_app server (ex. http://rpi3:3000...)>

node socket_app.js

node server.js

cd sense_updater

node updater_job.js


