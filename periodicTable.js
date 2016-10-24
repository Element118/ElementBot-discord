var pt = require('periodic-table');
module.exports = {};
module.exports.getElement = function(data) {
	var el = null;
	data = data[0].toUpperCase()+data.substring(1, data.length).toLowerCase();
	if (data.length >= 4 || data.toLowerCase() === "tin") {
		el = pt.elements[data];
	} else if (isNaN(data)) {
		el = pt.symbols[data];
	} else {
		el = pt.numbers[data];
	}
	return el;
};
module.exports.parseElement = function(data) {
	var result = "";
	var first = true;
	for (var i in data) {
		result +=  (first?"":"\n") + i + ": " + data[i];
		first = false;
	}
	return result;
};
