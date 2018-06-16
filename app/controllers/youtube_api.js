const {google} = require('googleapis');

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
						.catch( (err) => console.log('err 73: ', err))
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
let query = 'python';
var a = getYoutubeVideosInformation( {query, numberOfResultsPerPage} )
	.then(() => console.log('test ', videosList.length))
	.catch(err => console.log('main err ', err));

