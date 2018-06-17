const youtubeAPI = require('./youtubeAPI');
const videoUtils = require('../utils/videoUtils')();
const stringUtils = require('../utils/stringUtils')();
const moment = require('moment');

function getTimeScheduleToWatchAllVideos( {videos, availableTimeForDaysOfTheWeek} ) {

	if (!videos.length) return [];

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
				let validVideos = videoUtils.getVideosWithValidDuration( {videos, biggestAvailableTime} );
				return validVideos
			})
			.then(validVideos => {
				let mostUsedWords = stringUtils.getMostUsedWords( {videos: validVideos} );
				return {validVideos, mostUsedWords}
			})
			.then( ({validVideos, mostUsedWords}) => {
				let timeScheduleToWatchAllVideos = getTimeScheduleToWatchAllVideos({
					videos: validVideos, 
					availableTimeForDaysOfTheWeek
				});

				resolve({
					videos: validVideos,
					requiredTimeToWatchAllVideos: timeScheduleToWatchAllVideos.length, 
					words: mostUsedWords
				});
			})
			.catch(err => reject('err ', err));
	});
}

module.exports = function (maxResults, query, availableTimeForDaysOfTheWeek) {
	return getVideosData( {maxResults, query, availableTimeForDaysOfTheWeek} );
}
