const request = require('supertest');

const requester = request("http://localhost:40443");

/* Basic API tester */

requester
	.get('/api/pre')
	.expect('Content-Type', /json/)
	.expect('Content-Length', '13')
	.expect(200)
	.end(function(err, res) {
		if (err) throw err;
		if( !res || ! res.body || res.body.API !== "pre" ) {
			throw new Error('Pre does not return "pre"');
		}
	});

requester
	.get('/api/live')
	.expect('Content-Type', /json/)
	.expect('Content-Length', '14')
	.expect(200)
	.end(function(err, res) {
		if (err) throw err;
		if( !res || ! res.body || res.body.API !== "live" ) {
			throw new Error('Live does not return "live"');
		}
	});

requester
	.get('/api/post')
	.expect('Content-Type', /json/)
	.expect('Content-Length', '14')
	.expect(200)
	.end(function(err, res) {
		if (err) throw err;
		if( !res || ! res.body || res.body.API !== "post" ) {
			throw new Error('Post does not return "post"');
		}
	});