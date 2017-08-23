const configLocal = {
	api: {
		lockUuid : /s/  // e.g. 00000000-0000-4000-0000-00000000000
	},
	https: {
		keyFile: /s/,   // 'key.pem',
		certFile: /s/,  // 'cert.pem',
		ca: /s/,  // optional, 'ca.crm',
		port: /d/  // 40443
	},
	debug: false
};

module.exports = configLocal;