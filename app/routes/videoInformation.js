module.exports = function (app) {
	const controller = app.controllers.videoInformation;
	app.get('/video-information?', controller.getVideosData);
}