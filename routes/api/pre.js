const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

let requestDummy = {
	appOs: "OS System",
	appVersion: "current app version",
	key: config.local.api.lock,
	randomUuid: "123e4567-e89b-42d3-a456-426655440000",
	requestId: "123e4567-e89b-42d3-a456-426655440000",
	requestDateTime: (new Date()).toISOString(),
	payload: {/*something here*/}
};

router.get('/', (req, res, next) => {
	if( api.requestCheckWithResponse( requestDummy, next ) ) {
		res.json( { API: 'pre' } );
	}
});

router.post('/', (req, res, next) => {
	if( api.requestCheckWithResponse( req.body, next ) ) {
		console.log("POST api/pre/", "randomUuid", req.body.randomUuid);

		mongo.upsert(
			config.mongo.collections.pre,
			{ randomUuid: req.body.randomUuid },
			mongo.prepareUpsert(req.body.payload,req.body.requestDateTime),
			( error, data ) => {
				if( error ) {
					api.error( "There was a server database error", 500, next );
				}
				else {
					let response = api.prepareResponse( req.body.requestId );

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
		payload: ...
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
