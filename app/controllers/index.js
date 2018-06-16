module.exports = function() {
	var controller = {};

	controller.index = function(req, res) {
		res.sendFile('index.html');
	};

	return controller;
}
