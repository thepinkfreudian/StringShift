var raw_key = 'wordsarehard';

function code(str, raw_key) {
	var key = getKey(raw_key);
	var coded = "";
	for (var i = 0, j = 0; i < str.length; i++) {
		var character = str.charCodeAt(i);
		if (isLetter(character)) {
			coded += String.fromCharCode((character - 97 + key[j % key.length]) % 26 + 97);
			j++;
		} else {
			coded += str.charAt(i);
		}
	}
	return coded;
	
}

function getKey(raw_key) {
	var key = [];

	for (var i = 0; i < raw_key.length; i++) {
		var c = raw_key.charCodeAt(i);

		key.push((c - 65) % 32);
	}
	return key;
}


function isLetter(character) {
	return 97 <= character && character <= 122;  // 'a' to 'z'
}
