var word;

function getWords() {
    $.get('words.txt', function(data) {
        setWord(data);
    }, 'text');
} 

function setWord(data) {
    var words = data.split(',');
    var random = Math.floor(Math.random() * (words.length + 1));
    word = words[random].toLowerCase();
}

function scramble(word) {
    letters = word.split('');
    var loop_cycles = letters.length - 1;

    for (var i = loop_cycles; i > 0; i-- ) {
        var new_index = Math.floor(Math.random() * (i + 1));
        var temp = letters[i];
        letters[i] = letters[new_index];
        letters[new_index] = temp;
    }
    return letters.join('')
}


function scrambleWord(word) {
    var scrambled_word = scramble(word);
    $('#scrambled').text(scrambled_word);
}

