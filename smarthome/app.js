var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cons = require('consolidate');


var routes = require('./routes');
var users = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', cons.swig);                                                                     
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/users', users.list);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//------------------------
function printWeather(city, weather) {
    var message = 'In ' + city + ', there is ' + weather + ' degrees.';
    console.log(message);
}

function printError(error) {
    console.error(error.message);
}


app.get('/', function(req, res){
     
    var data = {
        x: [],
        y: []
    };
    
    var request = http.get('http://api.openweathermap.org/data/2.5/forecast?q=Chicago,us&mode=json&APPID=194c70465902901f5b86557ff8a4d959', function(response) {
        var body = '';

        response.on('data', function(chunck) {
            body += chunck;
        }); 

        response.on('end', function() {
            if(response.statusCode === 200) {
                try{
                    var weatherAPI = JSON.parse(body);
                    var counter = 0;
                    for(var key in weatherAPI){
                        if(weatherAPI.hasOwnProperty(key)){
                            counter++;
                            var val = weatherAPI[key];
                            //console.log(val);
                            if (counter === 5){
                                for(var i = 0; i < val.length; i++){
                                    data.x.push(val[i].dt_txt);
                                    data.y.push(val[i].main.temp - 273.15);
                                }
                                break;
                            }
                        }
                    }
                } catch(error) {
                    printError(error);
                }
            } else {
                printError('error getting info');
            }
        })
    }); 

    request.on('error', function (err) {
        printError(err);
    });

    var request = http.get('http://api.openweathermap.org/data/2.5/weather?q=Chicago,us&mode=json&APPID=194c70465902901f5b86557ff8a4d959', function(response) {    
        var body = '';

        response.on('data', function(chunck) {
            body += chunck;
        }); 

        response.on('end', function() {
            if(response.statusCode === 200){
                try{
                    var current = JSON.parse(body);
                    //console.log(current.name);
                    res.render('index', 
                        {
                            location:   current.name,
                            country :   current.sys.country,
                            id      :   current.id,
                            long    :   current.coord.lon,
                            lat     :   current.coord.lat,
                            status  :   current.weather[0].description,
                            press   :   current.main.pressure,
                            hum     :   current.main.humidity,
                            min     :   current.main.temp_min - 273.15,
                            max     :   current.main.temp_max - 273.15,
                            speed   :   current.wind.speed,   
                            val     :   data
                        }
                    );
                } catch(error){
                    printError(error);
                }
            }else{
                printError('error getting info');
            }
        });
    });
});

app.get('/settings', function(req, res){
    res.render('settings');
});

app.get('/devices', function(req, res){
    res.render('devices');
});

app.get('/charts', function(req,res){
	
    var data = {
        x: [],
        y: []
    };
    var dataTemp = {
        x: [],
        y: []
    };
    var dataPress = {
        x: [],
        y: []
    };
    var dataWind = {
        x: [],
        y: []
    };

    var name = "";
    var ba = "";
    var url = "";
    var ab = "";
    var link = "";

     var request = http.get('http://api.openweathermap.org/data/2.5/forecast?q=Chicago,us&mode=json&APPID=194c70465902901f5b86557ff8a4d959', function(response) {
        var body = '';

        response.on('data', function(chunck) {
            body += chunck;
        }); 

        response.on('end', function() {
            if(response.statusCode === 200) {
                try{
                    var weatherAPI = JSON.parse(body);
                    var counter = 0;
                    for(var key in weatherAPI){
                        if(weatherAPI.hasOwnProperty(key)){
                            counter++;
                            var val = weatherAPI[key];
                            //console.log(val);
                            if (counter === 5){
                                for(var i = 0; i < val.length; i++){
                                    dataTemp.x.push(val[i].dt_txt);
                                    dataTemp.y.push(val[i].main.temp - 273.15);
                                    dataPress.x.push(val[i].dt_txt);
                                    dataPress.y.push(val[i].main.pressure);
                                    dataWind.x.push(val[i].dt_txt);
                                    dataWind.y.push(val[i].wind.speed);
                                }
                                break;
                            }
                        }
                    }
                } catch(error) {
                    printError(error);
                }
            } else {
                printError('error getting info');
            }
        })
    }); 

    var options1 = {
        host: "api.watttime.org",
        port: 443,
        method: "GET",
        path: "/api/v1/balancing_authorities/?loc=POINT(-87.894%2041.791)",
        headers: {
            'Authorization': 'Token 0fc1ba65a6d23c36790e8d9aadaf94168792f0db'
        }
    };

    var request = https.get(options1, function(response) {
		var body = '';
        

		response.on('data', function(chunck) {
            body += chunck;

        }); 

        response.on('end', function() {
    		if(response.statusCode === 200){
    			try{
    				var wattTimeAPI = JSON.parse(body);
                    name = wattTimeAPI[0].name;
                    ba = wattTimeAPI[0].ba_type;
                    url = wattTimeAPI[0].url;
                    ab = wattTimeAPI[0].abbrev;
                    link = wattTimeAPI[0].link;                  
    				//console.log(wattTimeAPI);
    			} catch(error){
    				printError(error);
    			}
    		}else{
    			printError('error getting info');
    		}
        });

	});

     var options2 = {
        host: "api.watttime.org",
        port: 443,
        method: "GET",
        path: "/api/v1/datapoints/?ba=PJM",
        headers: {
            'Authorization': 'Token 0fc1ba65a6d23c36790e8d9aadaf94168792f0db'
        }
    };

    var request = https.get(options2, function(response) {
        var body = '';

        response.on('data', function(chunck) {
            body += chunck;
        });

        response.on('end', function(){
            if(response.statusCode === 200){
                try{
                    var wattTimeAPI = JSON.parse(body);
                    var results =  wattTimeAPI.results;
                    for(var i = 0; i < results.length; i++){
                        data.x.push(results[i].timestamp);
                        data.y.push(results[i].carbon);
                    }
                    res.render('charts', 
                        {
                            name    :   name,
                            ba      :   ba,
                            url     :   url,
                            ab      :   ab,
                            link    :   link,
                            val     :   data,
                            valT    :   dataTemp,
                            valP    :   dataPress,
                            valW    :   dataWind
                        }
                    );
                } catch(error){
                    printError(error);
                }
            }else{
                printError('error getting info');
            }
        }); 

    });

});

module.exports = app;