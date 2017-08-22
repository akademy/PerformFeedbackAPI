#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app'),
	debug = require('debug')('performfeedbackapi:server'),
	fs = require('fs'),
	https = require('https'),
	config = require("../config/config");


/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
};

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
};

const port = normalizePort(config.local.https.port || process.env.PORT || '3000');
app.set('port', port);

const options = {
	key: fs.readFileSync(config.local.https.keyFile),
	cert: fs.readFileSync(config.local.https.certFile)
};

const server = https.createServer(options, app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
