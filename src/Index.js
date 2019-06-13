
var _           = require('lodash'),
    fs          = require('fs'),
    path        = require('path'),
    express     = require('express'),
    bodyParser  = require('body-parser'),
    simpleargs  = require('simpleargs'),
    serveIndex  = require('serve-index'),
    serveStatic = require('serve-static'),
    Log         = require("./Log");
    cors        = require('cors')

///
/// Process the arguments
///
simpleargs
    .define('p','port', null, 'Port number')
    .define('d','dir', null, 'Logs directory');

var options = simpleargs(process.argv.slice(2));

/// validate the parameters
if(!options.port || !options.dir){
    console.log("Usage:");
    console.log();
    console.log("\t log-server -p PORT -d LOGSDIR");
    console.log();
    process.exit(1);
}


/// normalize options
options.dir = path.resolve(options.dir);


///
/// Initalize filesystem
///
if (!fs.existsSync(options.dir)){
    fs.mkdirSync(options.dir);
}

///
/// Initialize express
///

var app = express();
app.use(cors())

// parse text/plain
app.use(
    // bodyParser.raw({ type: 'text/plain', limit: 1024 * 1024 * 10 }));
    bodyParser.json());

///
/// POST '/:id/log' - Log the request body into a file. Each request will appended
/// into a file.    
///
// app.post('/:id/log', function(req, res){
//     console.log('AAAA');
//     // console.log(req);
//     var logName = req.params.id;
//     Log(options.dir, logName)
//     .write(req.body)
//     .then(function(){
//         res.send();
//     });

// });


app.post('/', function(req, res){
    // console.log("got log",JSON.stringify(req.body));
    var logName = req.params.id || 'tablet';
    console.log(JSON.stringify(req.body));
    const formatted = req.body.logs.map(log => {
        const logger = log.logger || 'none';
        return `${log.timestamp} [${log.level}] [${logger}] ${log.message} ${log.stacktrace}`
    });
    const logs = formatted.join('\r\n');
    Log(options.dir, logName)
    .write(logs)
    .then(function(){
        // console.log(logs);
        res.send("");
    });

});

// app.post('/api/users', function(req, res) {
//     var user_id = req.body.id;
//     var token = req.body.token;
//     var geo = req.body.geo;

//     res.send(user_id + ' ' + token + ' ' + geo);
// });

///
/// Get '/log' - Log the request body into a file. Each request will appended
/// into a file.
///
app.get('/*', serveIndex(options.dir, { icons: true, view: 'details' }));
app.get('/*.log', serveStatic(options.dir, { icons: true }));

/// Start server
app.listen(options.port);

///
/// Show somethin on stdout
///
console.log(
    _.template("http://localhost:<%= port %>")({ port: options.port }));

console.log(
    _.template("Logs directory '<%= dir %>'")({ dir: options.dir }));

/*
to run
node src/Index.js -p 8000 -d logs
*/