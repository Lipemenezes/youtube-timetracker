module.exports = function (app) {
	const controller = app.controllers.index;
	app.get('/', controller.index);
}