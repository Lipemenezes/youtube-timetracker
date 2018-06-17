function getNumberOfResultsPerPage( {maxResults, maxAllowedPerPage} ) {
	let numberOfResultsPerPage = [];
	let unpagedResults = maxResults;

	while (unpagedResults > 0) {
		if (unpagedResults >= maxAllowedPerPage) {
			numberOfResultsPerPage.push(maxAllowedPerPage);
			unpagedResults -= maxAllowedPerPage;
		} else {
			numberOfResultsPerPage.push(unpagedResults);
			unpagedResults -= unpagedResults;
		}
	}

	return numberOfResultsPerPage;
}

function getInitialAndFinalPositions( {numberOfResultsPerPage, iterator} ) {
	let initialPosition = numberOfResultsPerPage.slice(0, iterator).reduce((a, b) => a + b, 0);
	let finalPosition = initialPosition + numberOfResultsPerPage[iterator];

	if (iterator == 0)
		finalPosition -= 1;

	return {initialPosition, finalPosition};
}

module.exports = () => {
	return {
		getNumberOfResultsPerPage,
		getInitialAndFinalPositions
	}
}
