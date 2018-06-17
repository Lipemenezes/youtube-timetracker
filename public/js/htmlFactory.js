function getWordsHTML(words) {
	let html = `
		<h6>Palavras mais usadas nos títulos e descrições dos videos:</h6>
		<ol>
	`;

	for (i = words.length; i > 0; i--) {
		html += `<li><b>${words[i - 1].word}</b> - ${words[i - 1].timesUsed} vezes</li>`;
	}

	html += `</ol>`;

	return html;
}

function getVideosHTML(videos) {
	let videoHTML = `
		<h5>Todos os videos (${videos.length})</h5>
		<ul>
	`;

	videos.forEach( video => {
		videoHTML += `
			<li>
				<a target='_blank' href='https://www.youtube.com/watch?v=${video.id}'>${video.title}</a>
			</li>
		`;
	});

	videoHTML += `</ul>`
	return videoHTML;
}

function getEmptyResultHTML() {
	return `<h5>Nenhum video encontrado para esta busca</h5>`
}

function getVideosInformationHTML( {data, query} ) {
	if (data.videos.length == 0) return getEmptyResultHTML();

	let videoHTML = `
		<h5>Videos sobre ${query}</h5>
		<h6>Tempo necessário para assistir a todos os videos: <b>${data.requiredTimeToWatchAllVideos} dias</b></h6>
	`;

	videoHTML += getWordsHTML(data.words);

	videoHTML += getVideosHTML(data.videos);
	
	return videoHTML;
}
