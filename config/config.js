const configLocal = require( './config.local');

const config = {
	local: configLocal,
	mongo: {
		database: "performFeedback",
		collections: {
			pre: "pre",
			live: "live",
			post: "post"
		}
	}
};

module.exports = config;