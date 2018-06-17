const youtubeAPI = require('./youtubeAPI');
const moment = require('moment');

function getVideosWithValidDuration( {videos, biggestAvailableTime} ) {
	let biggestAvailableTimeInSeconds = biggestAvailableTime * 60;
	return videos.filter(video => video.duration <= biggestAvailableTimeInSeconds)
}

function getMostUsedWordsFromObject( {usedWords} ) {
	let sortedKeys = Object.keys(usedWords).sort((a, b) => usedWords[a] - usedWords[b]);

	let mostUsedWords = sortedKeys.slice(sortedKeys.length - 5, sortedKeys.length).map( (key) => {
		return {word: key, timesUsed: usedWords[key]}
	});

	return mostUsedWords;
}

function addUsedWordsToObject( {string, allUsedWords} ) {
	let formattedString = string.replace(/[^a-zA-Z ]/g, "");
	formattedString.split(' ').forEach(word => {
		let formattedWord = word.toLowerCase();
		if (word.length && allUsedWords.hasOwnProperty(formattedWord))
			allUsedWords[formattedWord] += 1
		else if (word.length)
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

function getTimeScheduleToWatchAllVideos( {videos, availableTimeForDaysOfTheWeek} ) {
	let dayOfTheWeek = moment().day();
	
	const availableTimeForDaysOfTheWeekInSeconds = availableTimeForDaysOfTheWeek.map(v => v * 60);

	let videosToWatch = videos.map(video => video);
	let videosForDays = [];

	while (dayOfTheWeek != null) {
		let canAddVideo = true;
		let availableTimeForDay = availableTimeForDaysOfTheWeekInSeconds[dayOfTheWeek];
		let videosForDay = [];

		while (canAddVideo) {
			if (videosToWatch[0].duration < availableTimeForDay) {
				videosForDay.push(videosToWatch[0]);
				availableTimeForDay -= videosToWatch[0].duration;
				videosToWatch.shift();
				if (videosToWatch.length == 0) {
					dayOfTheWeek = null;
					canAddVideo = false;
				}
			} else {
				canAddVideo = false;
			}
		}

		videosForDays.push(videosForDay);
		
		if (dayOfTheWeek != null) dayOfTheWeek += 1;
		if (dayOfTheWeek != null && dayOfTheWeek >= 7) dayOfTheWeek = 0
	}

	return videosForDays;
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
				let timeScheduleToWatchAllVideos = getTimeScheduleToWatchAllVideos({
					videos: validVideos, 
					availableTimeForDaysOfTheWeek
				});

				resolve({
					timeScheduleToWatchAllVideos, 
					videos: validVideos, 
					words: mostUsedWords
				});
			})
			.catch(err => reject('err ', err));
	});

}

module.exports = function (maxResults, query, availableTimeForDaysOfTheWeek) {
	return getVideosData( {maxResults, query, availableTimeForDaysOfTheWeek} );
}

// const maxResults = 200;
// const query = 'python';
// const availableTimeForDaysOfTheWeek = [50, 30, 120, 190, 250, 0, 15];

// getVideosData( {maxResults, query, availableTimeForDaysOfTheWeek} )
// 	.then(data => {
// 		data.videos.length
// 		var i = 0;
// 		data.timeScheduleToWatchAllVideos.forEach( (item) => {
// 			item.forEach(it => i += 1)
// 		})
// 		console.log(i)
// 	})
