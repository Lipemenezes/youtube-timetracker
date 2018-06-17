const app = require('./config/express')();
const jsonfile = require('jsonfile');

app.listen(3000, () => {
	console.log('Server is running!')
});
