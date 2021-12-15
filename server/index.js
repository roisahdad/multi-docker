//Require in the keys we established in the key.js file
const keys = require('./keys');

//Define and setup the Express side of the application
// require in the express, bodyParser, and cors libraries
//Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//Make a new express application and tell the app to use
// cors and bodyParder.json
const app = express();
//Cross origin resource sharing (cor) allows us to make request from
// one domain that the React appl is running to a different domain/port
// that the Express api is hosted on.
app.use(cors());
//The bodyParser library is going to parse incoming request from the React
// application and turn the body of the post request in to a json value that
// the Express api can work with
app.use(bodyParser.json());

//All logic required to get the Express app to communicate with the running
// Postgres server (sql type database).
//Postgres client setup
// Require the Pool module from the pg library
const { Pool } = require('pg');
//Create a new Postgres client out of the Pool module and pass in some 
// keys defined in the keys.js file which has already been required in at the
// beginning of this file
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
});
//Create a query and create a table delaying the table query until after a 
// connection is made. The table will store all the indices Postgres has seen
pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        //If there is an issue creating the table an error will post to the console
        .catch((err) => console.error(err));
});

//Establish a connection from the Express server to the Redis client
// Require in redis and create a redis client passing keys defined in the keys.js
// file which has already been required in at the beginning of this file
//Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    //If connection is lost to redis, retry once every 1 second
    retry_strategy: () => 1000,
});
//Once a client has opened a connection to the database that connection
// cannot be used for anything else.  A duplicate connection must be created
// to allow for additional connections
const redisPublisher = redisClient.duplicate();

//Define routes that Express will respond to
//Express route handlers
// Test route
app.get('/', (req, res) => {
    res.send('Hi');
});

//Route handler which queries a running Postgres instance and retrieve all
// indices that have been submitted to Postgres
app.get('/values/all', async(req, res) => {
    const values = await pgClient.query('SELECT * from values');
    //Restricts the send to return only information we retrieve from the database and 
    // no other information contained in the values object. Don't want metadata returned
    res.send(values.rows);
});

//Retievie all indices that have been submitted and returned the associated
// calculated indices
app.get('/values/current', async(req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});
//This express handler recieves the the entered index from the web page,
// Puts the index in Redis and wakes up the Worker process to calculate the 
// index

//Recieve new indices from the React application
app.post('/values', async(req, res) => {
    // Look at the index that was submitted and ...
    const index = req.body.index;
    //...an arbitrary cap preventing the processing of a large integer index
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }
    //Take calculated index and put it in the Redis datastore replacing the text
    // "Nothing yet!" This indicates it hasn't calculated a Fibanchi value for
    // the entered index.
    redisClient.hset('values', index, 'Nothing yet!');
    //Wakes up the working process telling it to pull a new value out of Redis
    // start calculating the Fibinachi value.
    redisPublisher.publish('insert', index);
    //Adds in the new index that was submitted to Postgress. For historical record
    // keeping
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    //Indicates that the working process is doing something
    res.send({ working: true });
});
//Listening to port 5000
app.listen(5000, err => {
    console.log('Listening');
});