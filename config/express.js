const express = require('express');
const consign = require('consign');

module.exports = () => {
	let app = express();
	app.set('port', 3000);
	app.use(express.static('./public'));
	app.set('views', './app/views');

    consign({cwd: 'app'})
		.include('controllers')
		.then('routes')
		.into(app);

    return app;
}
