const express = require('express'),
	router = express.Router();

router.get('/', (req, res, next) => {
	res.json( {API: 'pre'} );
});

/* Always:
	request: {
		appVersion: current app version,
		keyUuid: server generate uuid,
		randomUuid: app generate uuid,
		requestUuid: request generated uuid,
	};
	result: {
		resultUuid: must match request-uuid,
	};
*/

router.post( '/sync', (req, res) => {
	/*
	request1: {
	    ...
		gmtPhone: phone's date,
	};
	request2: {
		...
		gmtPhone: phone's date,
		gmtServerWas: server's previous result1 gmt-server
	};
	result1: {
	    ...
	    gmtServer: time at server
	};
	result2: {
		...
		gmtServer: '2017-08-21Z10:33:22'
	};
	*/
});

router.post('/id', (req, res) => {
	/*
	request: {
		...
		randomId: app random-id (e.g.'w12-gty'),
		confirmed: false/true,
		dateOfBirth: entered data,
	};
	result: {
		...
	    newRandomId: 'w12-gty',
	    confirmed: true
	};
	*/
});

module.exports = router;
