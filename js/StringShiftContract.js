// string.shift() - word scramble game for nebulas.io.

var StringShiftContract = function () {
    LocalContractStorage.defineProperty(this, 'user_count')
    LocalContractStorage.defineMapProperty(this, 'user_to_user_id')
    LocalContractStorage.defineMapProperty(this, 'user_id_to_username')
    LocalContractStorage.defineMapProperty(this, 'user_id_to_stats') // {username, games_won, games_played, percentage, last_outcome}
}

StringShiftContract.prototype = {
    init: function() {
        this.user_count = 1;
    },

    signIn: function() {
        var user_id = this.user_to_user_id.get(Blockchain.transaction.from);
        var user_exists = (!user_id ? 0 : 1);
        
        return JSON.stringify(user_exists);
    },

    createUser: function(username) {
        var user_id = this.user_to_user_id.get(Blockchain.transaction.from);
        
        if (!user_id) {
            user_id = this.user_count;
            this.user_count++;
            this.user_to_user_id.put(Blockchain.transaction.from, user_id);
        }

        this.user_id_to_username.put(user_id, username);
        this.user_id_to_stats.put(user_id, {username, games_won: 0, games_played: 0, percentage: 0, last_outcome: null});
    },

    getUserStats: function() {
        var user_id = this.user_to_user_id.get(Blockchain.transaction.from);
        var username = this.user_id_to_username.get(user_id);
        var stats = this.user_id_to_stats.get(user_id);

        return stats;
    },

    updateStats: function(encoded, guess) {
        if (Blockchain.transaction.value != 0) {
            throw new Error('Users only pay for gas.')
        }

        var user_id = this.user_to_user_id.get(Blockchain.transaction.from);
        var stats = this.user_id_to_stats.get(user_id);
        var raw_key = 'wordsarehard';
        
        stats.last_outcome = checkGuess(encoded, guess, raw_key);
        if (stats.last_outcome === 1) {
            stats.games_won++;
        }
        stats.games_played++;
        stats.percentage = Math.round(((stats.games_won / stats.games_played) * 100) * 10) / 10;

        this.user_id_to_stats.put(user_id, stats);
    },

    returnOutcome: function() {
        var user_id = this.user_to_user_id.get(Blockchain.transaction.from);
        var stats = this.user_id_to_stats.get(user_id);
        var outcome = stats.last_outcome;

        return outcome;
    },

    displayLeaderboard: function() {
        var leaders = [];

        for (var i = 1; i < this.user_count; i++) {
            var leader = this.user_id_to_stats.get(i);
            leaders.push(leader);
        }

        function compare(a, b) {
            const percentageA = a.percentage
            const percentageB = b.percentage
          
            let comparison = 0;
            if (percentageA > percentageB) {
              comparison = -1;
            } else if (percentageA < percentageB) {
              comparison = 1;
            }
            return comparison;
          }
          
          leaders.sort(compare);

        return leaders
    }
}

module.exports = StringShiftContract

// private methods
function decode(encoded, raw_key) {
    
    var key = getKey(raw_key);

    for (var i = 0; i < key.length; i++)
        key[i] = (26 - key[i]) % 26;

    decoded = code(encoded, key);

    return decoded
}

function code(str, key) {
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

function isLetter(c) {
	return 97 <= c && c <= 122;  // 'a' to 'z'
}

function checkGuess(encoded, guess, raw_key) {
    var word = decode(encoded, raw_key);

    var outcome = (guess === word ? 1 : 0);

    return outcome;
}

