const configLocal = require( './config.local');

const config = {
	local: configLocal,
	mongo: {
		database: "performFeedback",
		collections: {
			pre: "pre",
			live: "live",
			post: "post",
			private: "private",
			combined : "combined",
			reduced: "reduced",
			offset: "offset",
			flatten: "flatten",
			flattenLive: "flattenLive"
		}
	}
};

module.exports = config;