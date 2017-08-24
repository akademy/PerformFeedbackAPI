const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

let requestDummy = {
	appOs: "OS System",
	appVersion: "current app version",
	key: 'fb57887d-0fc5-4005-a588-0ac140336f69',
	randomUuid: "app generate uuid",
	requestId: "request generated uuid"
};

router.get('/', (req, res, next) => {
	if( api.requestRespond( requestDummy, res ) ) {
		res.json( { API: 'pre' } );
	}
});

router.post('/', (req, res) => {
	if( api.requestRespond( req.body, res ) ) {
		console.log("api/pre", req.body);

		mongo.mongoUpsert(
			config.mongo.collections.pre,
			{ randomUuid: req.body.randomUuid },
			req.body.payload,
			( error, data ) => {
				if( !error ) {
					let response = api.responseSetup( req.body.requestId );

					response.payload = {
						updated : true
					};

					res.json( response );
				}
			}
		)
	}
});

/* Always:
	request: {
		appOs: OS System
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
