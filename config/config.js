const configLocal = require( './config.local');

const config = {
	local: configLocal,
	mongo: {
		database: "performFeedback",//"performFeeback1",//
		collections: {
			pre: "pre",
			live: "live",
			post: "post",
			private: "private",
			combined : "combined",
			reduced: "reduced"
		}
	}
};

module.exports = config;