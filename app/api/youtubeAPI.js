const {google} = require('googleapis');
const moment = require('moment');
const videoUtils = require('../utils/videoUtils')();
const config = require('../../config/config.json');

const GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST = 50;
const youtube = getAuthenticatedAPI();

function getAuthenticatedAPI() {
	const YOUTUBE_API_KEY = config.GOOGLE_API_KEY;

	const youtube = google.youtube({
		version: 'v3',
		auth: YOUTUBE_API_KEY
	});

	return youtube;
}

function getYoutubeVideosInformationFromAPI( {query, pageToken, numberOfResultsPerPage, iterator, videosList} ) {
	if (!iterator) iterator = 0;

	return new Promise((resolve, reject) => {
		youtube.search.list(
			{
				part: 'id,snippet',
				type: 'video',
				q: query,
				maxResults: numberOfResultsPerPage[iterator],
				pageToken: pageToken ? pageToken : ''
			}, (err, response) => {
				if (err) reject({'err': err});

				let nextPageToken = response.data.nextPageToken;
				for (item of response.data.items) {
					videosList.push({
						'id': item.id.videoId,
						'title': item.snippet.title,
						'description': item.snippet.description,
					});
				}

				if (nextPageToken && (iterator + 1) < numberOfResultsPerPage.length) {
					return getYoutubeVideosInformationFromAPI({
						query, 
						pageToken: nextPageToken, 
						numberOfResultsPerPage, 
						iterator: (iterator + 1),
						videosList,
					}).then(() => resolve())
					.catch((err) => console.log('err getYoutubeVideosInformationFromAPI: ', err));
				} else {
					return resolve();
				}				
			}
		);
	});
}

function getVideosDuration( {videosIds, numberOfResultsPerPage, iterator, videosDuration} ) {
	if (!iterator) iterator = 0;

	let {initialPosition, finalPosition} = videoUtils.getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} );

	return new Promise((resolve, reject) => {
		youtube.videos.list(
			{
				part: 'id,contentDetails',
				id: videosIds.slice(initialPosition, finalPosition).join(','),
				maxResults: numberOfResultsPerPage[iterator],
			}, (err, response) => {
				if (err) reject({'err': err});

				for (item of response.data.items) {
					videosDuration[item.id] = moment.duration(item.contentDetails.duration).asSeconds();
				}

				if ((iterator + 1) < numberOfResultsPerPage.length) {
					return getVideosDuration({
						videosIds, 
						numberOfResultsPerPage, 
						iterator: (iterator + 1),
						videosDuration
					})
						.then(() => resolve())
						.catch(err => console.log("getVideosDuration loop catch", err))
				} else {
					return resolve()
				}				
			}
		);
	});
}

function getVideosData( {maxResults, query} ) {
	let numberOfResultsPerPage = videoUtils.getNumberOfResultsPerPage({
		maxResults, 
		maxAllowedPerPage: GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST
	});

	let videosList = [];
	let videosDuration = {};

	return new Promise((resolve, reject) => {
		getYoutubeVideosInformationFromAPI( {query, numberOfResultsPerPage, videosList} )
			.then(() => {
				let videosIds = videosList.map(video => video.id);
				
				getVideosDuration( {videosIds, numberOfResultsPerPage, videosDuration} )
					.then( (data) => {
						videosList = videoUtils.getVideosListWithDuration( {videosList, videosDuration} );
						resolve(videosList);
					})
					.catch((err) => console.log("first getVideosDuration catch", err));
			})
			.catch(err => console.log("getVideosData catch", err));
	});
}

module.exports = (maxResults, query) => {
	return getVideosData( {maxResults, query} );
}
