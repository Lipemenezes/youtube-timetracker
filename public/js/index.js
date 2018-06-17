$(document).ready(() => {
	activateEventListeners();
});

function activateEventListeners() {
	$('#search-wrapper').keyup( evt => {
		if (evt.keyCode === 13) {
			if (!$('#btn-search-videos').prop('disabled'))
				searchVideos()
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

	if (data) {
		$('#videos').empty();
		showLoading();
		hideRequiredFieldsAlert();
		getVideosInformation( data );
	} else {
		hideLoading();
		enableSearchButton();
		showRequiredFieldsAlert();
	}
}
