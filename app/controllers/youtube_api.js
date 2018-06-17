const {google} = require('googleapis');
var moment = require('moment');

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

function getYoutubeVideosInformation( {query, pageToken, numberOfResultsPerPage, iterator} ) {
	if (!iterator) iterator = 0;
	let promise = new Promise((resolve, reject) => {
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
					return getYoutubeVideosInformation( {query, pageToken: nextPageToken, numberOfResultsPerPage, iterator: (iterator + 1)} )
						.then(() => resolve())
						.catch( (err) => console.log('err getYoutubeVideosInformation: ', err))
				} else {
					return resolve()
				}				
			}
		);
	});
	return promise;
}

function getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} ) {

	// console.log('it ', iterator)

	let initialPosition = numberOfResultsPerPage.slice(0, iterator).reduce((a, b) => a + b, 0);
	let finalPosition = initialPosition + numberOfResultsPerPage[iterator];

	if (iterator == 0)
		finalPosition -= 1;

	// console.log('diff ', finalPosition - initialPosition)

	// console.log('init ', initialPosition, ' | final ', finalPosition)

	return {initialPosition, finalPosition};
}

function getVideosDuration( {videosIds, numberOfResultsPerPage, iterator} ) {
	if (!iterator) iterator = 0;

	let {initialPosition, finalPosition} = getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} );

	let promise = new Promise((resolve, reject) => {
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
					return getVideosDuration( {videosIds, numberOfResultsPerPage, iterator: (iterator + 1)} )
						.then(() => resolve())
						.catch( (err) => console.log('err getVideosDuration: ', err))
				} else {
					return resolve()
				}				
			}
		);
	});
	return promise;
}

const GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST = 50;
let maxResults = 177;

let numberOfResultsPerPage = getNumberOfResultsPerPage( {maxResults} );

const youtube = getAuthenticatedAPI();

let videosList = [];
let videosDuration = {};

let query = 'python';
var a = getYoutubeVideosInformation( {query, numberOfResultsPerPage} )
	.then(() => {
		console.log(videosList.length)
		logRepeatedIds();

		let videosIds = videosList.map(video => video.id);
		
		getVideosDuration( {videosIds, numberOfResultsPerPage} )
			.then( () => {
				videosList = videosList.map( (video) => {
					video['duration'] = videosDuration[video.id]
					return video
				})
			})
			.catch((err) => console.log('err main getVideosDuration: ', err));
	})
	.catch(err => console.log('main err ', err));

function logRepeatedIds() {
	let ids = {};
	videosList.forEach( (video) => {
		if (!ids.hasOwnProperty(video.id))
			ids[video.id] = 1
		else 
			ids[video.id] += 1
	});

	Object.keys(ids).forEach( (key) => {
		if (ids[key] > 1)
			console.log(key, ' is repeated - ', ids[key])
	})
}