const youtubeAPI = require('../api/youtubeAPI');

function getVideosWithValidDuration( {videos, biggestAvailableTime} ) {
	let biggestAvailableTimeInSeconds = biggestAvailableTime * 60;
	return videos.filter(video => video.duration <= biggestAvailableTimeInSeconds)
}

function getMostUsedWordsFromObject( {usedWords} ) {
	let sortedKeys = Object.keys(usedWords).sort((a, b) => usedWords[a] - usedWords[b]);

	let mostUsedWords = sortedKeys.slice(sortedKeys.length - 5, sortedKeys.length).map( (key) => {
		return {key: key, timesUsed: usedWords[key]}
	});

	return mostUsedWords;
}

function addUsedWordsToObject( {string, allUsedWords} ) {
	let formattedString = string.replace(/[^a-zA-Z ]/g, "");
	formattedString.split(' ').forEach(word => {
		let formattedWord = word.toLowerCase();
		if (allUsedWords.hasOwnProperty(formattedWord))
			allUsedWords[formattedWord] += 1
		else
			allUsedWords[formattedWord] = 1
	});
}

function getMostUsedWords( {videos} ) {
	let allUsedWords = {};

	videos.forEach( video => {
		addUsedWordsToObject( {string: video.title, allUsedWords} );
		addUsedWordsToObject( {string: video.description, allUsedWords} );
	});

	let mostUsedWords = getMostUsedWordsFromObject( {usedWords: allUsedWords} );

	return mostUsedWords;
}

function getTimeRequiredToWatchAllVideos( {videos, availableTimeForDaysOfTheWeek} ) {
	var dayOfTheWeek = 0;

	let videosToWatch = videos;
	let 

	while (dayOfTheWeek != null) {
		
		
		dayOfTheWeek += 1;
		if (dayOfTheWeek > 7) dayOfTheWeek = 0
		if (videosToWatch.length == 0) dayOfTheWeek = null;
	}

}

function getVideosData( {availableTimeForDaysOfTheWeek, maxResults, query} ) {
	let biggestAvailableTime = Math.max(...availableTimeForDaysOfTheWeek);

	return new Promise((resolve, reject) => {
		youtubeAPI(maxResults, query)
			.then(videos => {
				let validVideos = getVideosWithValidDuration( {videos, biggestAvailableTime} );
				return validVideos
			})
			.then(validVideos => {
				let mostUsedWords = getMostUsedWords( {videos: validVideos} );
				return {validVideos, mostUsedWords}
			})
			.then( ({validVideos, mostUsedWords}) => {
				let timeRequiredToWatchAllVideos = getTimeRequiredToWatchAllVideos({
					videos: validVideos, 
					availableTimeForDaysOfTheWeek
				});
				resolve( {} );
			})
			.catch(err => reject('err ', err));
	});

}



let availableTimeForDaysOfTheWeek = [20, 30, 40, 150, 180, 0, 10];
let query = 'python';
let maxResults = 50;


getVideosData( {availableTimeForDaysOfTheWeek, maxResults, query} )
	.then(data => console.log('finish\n', data))
	.catch(err => console.log('err \n', err))

