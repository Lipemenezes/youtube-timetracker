function getDaysOfTheWeekMinutesData() {
	let daysOfTheWeekMinutes = [];

	$('.time-input').each(function() { 
		daysOfTheWeekMinutes.push($(this).val());
	});

	return daysOfTheWeekMinutes;
}

function getDataToSearchVideo() {

	let query = $('#query').val();
	let maxResults = 200;
	let daysOfTheWeekMinutesData = getDaysOfTheWeekMinutesData();

	if (!query || !maxResults || !daysOfTheWeekMinutesData) {
		return null;
	}

	return {query, maxResults, daysOfTheWeekMinutesData};

}

function getVideosInformationHTML( {data, query} ) {
	let videoHTML = `
		<h5>Videos sobre ${query}</h5>
		<h6>Tempo necessário para assistir a todos os videos: ${data.requiredTimeToWatchAllVideos} dias</h6>
		<h6>Palavras mais usadas:</h6>
	`;

	for (i = data.words.length; i > 0; i--) {
		videoHTML += `<span>${data.words[i - 1].word} - ${data.words[i - 1].timesUsed} vezes </span><br/>`;
	}

	videoHTML += `<h5>Todos os videos</h5>`;

	data.videos.forEach( video => {
		videoHTML += `
			<div data-video-id=${video.id}>
				${video.title}
			</div>
		`;
	});

	return videoHTML;
}

function getVideosInformation( {query, maxResults, daysOfTheWeekMinutesData} ) {
	$.getJSON({
		url: `/video-information?maxResults=${maxResults}&query=${query}&daysTime=${daysOfTheWeekMinutesData.join(',')}`,
		success: response => {
			const videoHTML = getVideosInformationHTML( {data: response.data, query} )

			$('#videos').html(videoHTML);
		},
	});
}

function showRequiredFieldsAlert() {
	$('#required-fields-alert').removeClass('d-none');
}

function hideRequiredFieldsAlert() {
	$('#required-fields-alert').addClass('d-none');
}

function searchVideos() {
	let data = getDataToSearchVideo();

	if (data) {
		hideRequiredFieldsAlert();
		getVideosInformation( data );
	} else {
		showRequiredFieldsAlert();
	}
}
