const {google} = require('googleapis');
const moment = require('moment');
const GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST = 50;
const youtube = getAuthenticatedAPI();

function getAuthenticatedAPI() {
	const YOUTUBE_API_KEY = "";

	const youtube = google.youtube({
		version: 'v3',
		auth: YOUTUBE_API_KEY
	});

	return youtube;
}

function getNumberOfResultsPerPage( {maxResults} ) {
	let numberOfResultsPerPage = [];
	let i = maxResults;

	while (i > 0) {
		if (i >= GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST) {
			numberOfResultsPerPage.push(GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST);
			i -= GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST;
		} else {
			numberOfResultsPerPage.push(i);
			i -= i;
		}
	}

	return numberOfResultsPerPage;
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

				// console.log(response.data.items[0])

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

function getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} ) {
	let initialPosition = numberOfResultsPerPage.slice(0, iterator).reduce((a, b) => a + b, 0);
	let finalPosition = initialPosition + numberOfResultsPerPage[iterator];

	if (iterator == 0)
		finalPosition -= 1;

	return {initialPosition, finalPosition};
}

function getVideosDuration( {videosIds, numberOfResultsPerPage, iterator, videosDuration} ) {
	if (!iterator) iterator = 0;

	let {initialPosition, finalPosition} = getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} );

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
						.catch( (err) => console.log('err getVideosDuration: ', err))
				} else {
					return resolve()
				}				
			}
		);
	});
}

function getVideosListWithDuration( {videosList, videosDuration} ) {
	var videosListWithDuration = [];
	videosListWithDuration = videosList.map( (video) => {
		video['duration'] = videosDuration[video.id]
		return video
	});
	return videosListWithDuration;
}

function getVideosData( {maxResults, query} ) {
	let numberOfResultsPerPage = getNumberOfResultsPerPage( {maxResults} );

	let videosList = [];
	let videosDuration = {};

	return new Promise((resolve, reject) => {
		getYoutubeVideosInformationFromAPI( {query, numberOfResultsPerPage, videosList} )
			.then(() => {
				let videosIds = videosList.map(video => video.id);
				
				getVideosDuration( {videosIds, numberOfResultsPerPage, videosDuration} )
					.then( () => {
						videosList = getVideosListWithDuration( {videosList, videosDuration} );
						resolve(videosList);
					})
					.catch((err) => {
						console.log('err main getVideosDuration: ', err);
					});
			})
			.catch(err => console.log('main err ', err));
	});
}

module.exports = function (maxResults, query) {
	return getVideosData( {maxResults, query} );
}
