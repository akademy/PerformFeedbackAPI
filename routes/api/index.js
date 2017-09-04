const express = require('express'),
	router = express.Router();

const api = require( "../../lib/api" ),
	mongo = require( "../../lib/mongo"),
	config = require("../../config/config");

const pre = require('./pre'),
		live = require('./live'),
		post = require('./post');

router.use( '/pre', pre );
router.use( '/live', live );
router.use( '/post', post );

/*router.get('/', (req, res, next) => {
	res.json( {API: ''} );
});*/

router.get('/', (req, res, next) => {
	mongo.select( (error, data ) => {

		let body1 = [];
		let keys = [];
		if( data.pre.length > 0) {
			keys = Object.keys( data.pre[0] );
		}
		else {
			body1.push("<p>Empty</p>");
		}

		data.pre.forEach( (item) => {
			keys.forEach( (key) => {
				if( key in item ) {
					body1.push(`<p><b>${key}</b>:${item[key]}</p>`);
				}
			});
			body1.push( "<hr/>" );
		} );

		body1 = body1.join("");

		let body2= [];
		keys = [];
		if( data.live.length > 0) {
			keys = Object.keys( data.live[0] );
		}
		else {
			body2.push("<p>Empty</p>");
		}

		data.live.forEach( (item) => {
			keys.forEach( (key) => {
				if( key in item ) {
					body2.push(`<p><b>${key}</b>:${item[key]}</p>`);
				}
			});
			body2.push( "<hr/>" );
		} );

		body2 = body2.join("");

		let body3= [];
		keys = [];
		if( data.post.length > 0) {
			keys = Object.keys( data.post[0] );
		}
		else {
			body3.push("<p>Empty</p>");
		}

		data.post.forEach( (item) => {
			keys.forEach( (key) => {
				if( key in item ) {
					body3.push(`<p><b>${key}</b>:${item[key]}</p>`);
				}
			});
			body3.push( "<hr/>" );
		} );

		body3 = body3.join("");

		res.send( `
			<html><body>
				<h1>Data</h1>
				<h2>Profile</h2>
				${body1}
				<hr/>
				<h2>Live</h2>
				${body2}
				<hr/>
				<h2>Post</h2>
				${body3}
				<hr/>
			</body></html>
		` );
	});
});

module.exports = router;
