
// get authenticated api

const {google} = require('googleapis');

const YOUTUBE_API_KEY = "AIzaSyBYHwW5IaDM08kcsrd4egAiD247FtR8uDs";

const youtube = google.youtube({
	version: 'v3',
	auth: YOUTUBE_API_KEY
});



// prepare information

const GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST = 50;
let maxResults = 200;

if (maxResults > 200)
	maxResults = 200;

var numberOfRequestsPerPage = [];
let i = maxResults;
while (i > 0) {
	if (i >= GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST) {
		numberOfRequestsPerPage.push(GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST);
		i -= GOOGLE_MAX_ALLOWED_RESULTS_PER_REQUEST;
	} else {
		numberOfRequestsPerPage.push(i);
		i -= i;
	}
}



let videosList = [];
var promises = [];
let query = 'python';
getYoutubeVideosInformation( {query, numberOfRequestsPerPage, iterator: 0} )
	.catch(err => console.log('main err ', err))


function getYoutubeVideosInformation( {query, pageToken, numberOfRequestsPerPage, iterator} ) {
	if (iterator >= numberOfRequestsPerPage.length) {
		console.log ('finish iterate ', iterator, ' ', numberOfRequestsPerPage.length)
		return null
	}
	var promise = new Promise((resolve, reject) => {
		youtube.search.list(
			{
				part: 'id,snippet',
				type: 'video',
				q: query,
				maxResults: numberOfRequestsPerPage[iterator],
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
				if (nextPageToken && (iterator + 1) < numberOfRequestsPerPage.length) {
					getYoutubeVideosInformation( {query, pageToken: nextPageToken, numberOfRequestsPerPage, iterator: (iterator + 1)} )
						.catch( (err) => console.log('err 73: ', err))
				} else {
					console.log('finish videos length: ', videosList.length)
				}				
					
				resolve({nextPageToken});

			}
		);
	});
	promises.push(promise);
	return promise;
}


// var videos = getYoutubeVideosInformation

// Promise.all(promises)
// 	.then( data => {
// 		let allVideosInformation = [];
// 		data.forEach( (data) => {
// 			allVideosInformation = [...allVideosInformation, ...data.videosInformation]
// 		});
// 		console.log('data: ', allVideosInformation)
// 	});


// chamar api
// pegar resultado
// chamar api




