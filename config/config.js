const configLocal = require( './config.local');

const config = {
	local: configLocal,
	mongo: {
		database: "performFeedback",
		collections: {
			pre: "pre",
			live: "live",
			post: "post",
			private: "private"
		}
	}
};

module.exports = config;