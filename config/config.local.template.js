const configLocal = {
	api: {
		lockUuid : /\s/  // e.g. '00000000-0000-4000-0000-00000000000'
	},
	https: {
		keyFile: /\s/,   // optional, e.g. 'key.pem',
		certFile: /\s/,  // optional, e.g. 'cert.pem',
		ca: /\s/,  // optional, e.g.'ca.crm',
		port: /\s/  // optional, default:3000 e.g. '40443'
	},
	debug: false,
	mongo: {
		host: /\s/,   // 'localhost',
		port: /\s/,  // '27017',
	}
};

module.exports = configLocal;