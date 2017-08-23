const config = require( "../config/config" ),
	uuid = require( "react-native-uuid" );

const api = {
	/*
	request: {
		appOs: OS System
		appVersion: current app version,
		key: server generate uuid,
		randomUuid: app generate uuid,
		requestId: request generated uuid,
	};
	result: {
		resultId: must match requestId,
	};
	*/

	requestRespond: ( request, response ) => {
		if( api.requestGood( request ) ) {
			return true;
		}
		else {
			response.status(404);
			response.end();

			return false;
		}
	},

	requestGood: ( request, response ) => {
		if (!request.hasOwnProperty("appOs")) {
			return false;
		}
		if (!request.hasOwnProperty("appVersion")) {
			return false;
		}
		if (!request.hasOwnProperty("key")) {
			return false;
		}
		if (!request.hasOwnProperty("randomUuid")) {
			return false;
		}
		if (!request.hasOwnProperty("requestId")) {
			return false;
		}

		if (request.keyUuid !== config.local.api.lockUuid) {
			return false;
		}

		// TODO: Test valid uuids, necessary?
		let test = uuid.parse(request.randomUuid);
		test = uuid.parse(request.requestUuid);

		return true;
	}

};

module.exports = api;