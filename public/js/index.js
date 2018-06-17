$(document).ready(() => {
	activateEventListeners();
});

function activateEventListeners() {
	$('#search-wrapper').keyup( evt => {
		if (evt.keyCode === 13) {
			console.log('enter')
	    } else {
			console.log('key')    
		}
	});
}

function getDaysOfTheWeekMinutesData() {
	let daysOfTheWeekMinutes = [];

	$('.time-input').each(function() { 
		if ($(this).val() != "")
			daysOfTheWeekMinutes.push($(this).val());
	});

	return daysOfTheWeekMinutes;
}

function getDataToSearchVideo() {

	let query = $('#query').val();
	let maxResults = 200;
	let daysOfTheWeekMinutesData = getDaysOfTheWeekMinutesData();

	if (!query || !maxResults || !daysOfTheWeekMinutesData) return null;

	if (daysOfTheWeekMinutesData.length < 7) return null;

	return {query, maxResults, daysOfTheWeekMinutesData};
}

function getVideosInformationHTML( {data, query} ) {
	let videoHTML = `
		<h5>Videos sobre ${query}</h5>
		<h6>Tempo necessário para assistir a todos os videos: <b>${data.requiredTimeToWatchAllVideos} dias</b></h6>
		<h6>Palavras mais usadas nos títulos e descrição dos videos:</h6>
		<ol>
	`;

	for (i = data.words.length; i > 0; i--) {
		videoHTML += `<li><b>${data.words[i - 1].word}</b> - ${data.words[i - 1].timesUsed} vezes </li>`;
	}

	videoHTML += `
		</ol>
		<h5>Todos os videos</h5>
		<ul>
	`;

	data.videos.forEach( video => {
		videoHTML += `
			<li>
				<a target='_blank' href='https://www.youtube.com/watch?v=${video.id}'>${video.title}</a>
			</li>
		`;
	});

	videoHTML += `</ul>`

	return videoHTML;
}

function getVideosInformation( {query, maxResults, daysOfTheWeekMinutesData} ) {
	$.getJSON({
		url: `/video-information?maxResults=${maxResults}&query=${query}&daysTime=${daysOfTheWeekMinutesData.join(',')}`,
		success: response => {
			const videoHTML = getVideosInformationHTML( {data: response.data, query} )

			$('#videos').html(videoHTML);
			enableSearchButton();
			hideLoading();
		},
	});
}

function showRequiredFieldsAlert() {
	$('#required-fields-alert').removeClass('d-none');
}

function hideRequiredFieldsAlert() {
	$('#required-fields-alert').addClass('d-none');
}

function disableSearchButton() {
	$('#btn-search-videos').attr('disabled', true);
}

function enableSearchButton() {
	$('#btn-search-videos').attr('disabled', false);
}

function showLoading() {
	$('#loading').removeClass('d-none');
}

function hideLoading() {
	$('#loading').addClass('d-none');
}

function searchVideos() {
	let data = getDataToSearchVideo();

	disableSearchButton();
	$('#videos').empty();

	if (data) {
		showLoading();
		hideRequiredFieldsAlert();
		getVideosInformation( data );
	} else {
		hideLoading();
		enableSearchButton();
		showRequiredFieldsAlert();
	}
}
