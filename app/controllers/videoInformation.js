const videoInformationAPI = require('../api/videoInformationAPI');

function validateParameters(params) {
	let errorList = [];

	if (!params.maxResults) errorList.push('maxResults is required')
	if (params.maxResults > 200) errorList.push('maxResults max value is 200')
	if (!params.query) errorList.push('query is required')
	if (!params.daysTime) errorList.push('daysTime is required') 

	return errorList;
}

module.exports = function() {
	var controller = {};

	controller.getVideosData = function(req, res) {
		const params = req.query;
		let errorList = validateParameters(params);
		
		if (errorList.length > 0) {
			res.json({'status': 'ERR', 'errors': errorList})	 
		} else {
			videoInformationAPI(params.maxResults, params.query, params.daysTime.split(','))
				.then(data => res.json({'status': 'OK', 'data': data}))
				.catch(err => console.error(err))
		}
	};

	return controller;
}
