function getMostUsedWords( {videos} ) {
	let allUsedWords = {};

	videos.forEach( video => {
		addUsedWordsToObject( {string: video.title, allUsedWords} );
		addUsedWordsToObject( {string: video.description, allUsedWords} );
	});

	let mostUsedWords = getMostUsedWordsFromObject( {usedWords: allUsedWords} );

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

function getMostUsedWordsFromObject( {usedWords} ) {
	let sortedKeys = Object.keys(usedWords).sort((a, b) => usedWords[a] - usedWords[b]);

	let mostUsedWords = sortedKeys.slice(sortedKeys.length - 5, sortedKeys.length).map( (key) => {
		return {word: key, timesUsed: usedWords[key]}
	});

	return mostUsedWords;
}

module.exports = () => {
	return {
		getMostUsedWords
	};
}
