const express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');

const indexRoutes = require('./routes/index'),
	testsRoutes = require('./routes/test'),
	apiRoutes = require('./routes/api');

const api = require('./lib/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);
app.use('/test', testsRoutes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	api.error404(next);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// TODO: Investiage why this isn't returning title, and is returning statusText
	//err.title = err.message; // jsonapi, http://jsonapi.org/format/#errors

	console.log(err);

	res.status(err.status || 500).json({
		status: err.status || 500,
		title: err.message
	});

	// render the error page
	//res.status();
	//res.send(err);
});

module.exports = app;
