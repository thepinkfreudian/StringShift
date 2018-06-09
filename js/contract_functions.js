var contract_address = 'n1wcVz2bmC966gY4EYSLxn9PCGgu8BkxeRf';
var NebPay = require("nebpay");
var nebPay = new NebPay();
var nebulas = require("nebulas");
var neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest('https://mainnet.nebulas.io'));

function getTxStatus(txhash, listener) {
    neb.api.getTransactionReceipt({hash: txhash}).then(listener);
}

if (typeof(webExtensionWallet) === "undefined") {
    alert('Looks like you don\'t have a wallet installed. You can get the extension from the link in the footer.');
}

function signIn() {
    nebPay.simulateCall(contract_address, 0, "signIn", null, {
        // callback: NebPay.config.testnetUrl,
        listener: onsignIn
    });
}

function onsignIn(resp) {
    if (resp) {
        var response = JSON.parse(resp.result);
        if (response == 0) {
            $('.username-entry').show();
        } else {
            $('.username-entry').hide();
            $('#sign-in').hide();
            $('#main-title').hide();
            $('#nav-title').show();
            $('.start').show();
            $('.guess-entry').show();
        }
    }
} 

function createUser(username) {
    nebPay.call(contract_address, 0, "createUser", JSON.stringify([username]), {
        // callback: NebPay.config.testnetUrl,
        listener: onCreateUser
    });
}

function onCreateUser(resp) {
    
    function poll() {
        getTxStatus(resp.txhash, function(resp) {
            if (resp.status == 1) {
                $('#username-pending').hide();
                $('.username-entry').text('Success! Click \'Sign In\' to start playing.')
            } else {
                setTimeout(poll, 3000);
                $('#username-pending').show();
                $('#username-pending').html('<span>sending transaction... </span><div class="loading"></div>');;
            }
        });
    }
    poll();
}

function getUserStats() {
    nebPay.simulateCall(contract_address, 0, "getUserStats", null, {
        // callback: NebPay.config.testnetUrl,
        listener: onGetUserStats
    })
}

function onGetUserStats(resp) {
    if (resp) {
       var response = JSON.parse(resp.result);
       var stat_display = $('#display-user-stats');
       stat_display.text('');
       
       if (!response.username) {
           $('#display-username').html( '<span class="stat-span username">' + response + '<span>');
       } else {
           var html = '';
           $('#display-username').html( '<span class="stat-span username">' + response.username + '<span>');
            
            html += '<span class="stat-span"><strong>Games Won:</strong>  ' + response.games_won + '<span>';
            html += '<span class="stat-span"><strong>Games Played:</strong>  ' + response.games_played + '<span>';
            html += '<span class="stat-span"><strong>Win Percentage:</strong>  ' + response.percentage + '%<span>';
            
            stat_display.append(html);
        }
    }     
}


function sendGuess() {
    var encoded = code(word, raw_key);
    var guess = $('#guess').val()
    nebPay.call(contract_address, 0, "updateStats", JSON.stringify([encoded, guess]), {
        //callback: NebPay.config.testnetUrl,
        listener: onSendGuess
    });
}

function onSendGuess(resp) {

    function poll() {
        getTxStatus(resp.txhash, function(resp) {
            if (resp.status == 1) {
                $('#result-pending').html('&nbsp;');
                nebPay.simulateCall(contract_address, 0, "returnOutcome", null, {
                   // callback: NebPay.config.testnetUrl,
                    listener: didPlayerWin
                });
            } else {
                setTimeout(poll, 5000);
                $('#result-pending').html('<span>sending transaction... </span><div class="loading"></div>');
            }
        });
    }
    poll();
}

function didPlayerWin(resp) {
    var response = JSON.parse(resp.result);
    if (response) {
        var outcome = response
    }
    $('#guess').val('');
    $('#scrambled').text('');
    $('#scrambled').hide();
    $('#scrambled-result').show();

    var rand = Math.floor(Math.random() * positive.length);
    if (outcome === 1) {
        $('#scrambled-result').text(positive[rand]);
    } else {
        $('#scrambled-result').text(negative[rand]);
    }
    getWords();
}

function displayLeaderboard() {
    nebPay.simulateCall(contract_address, 0, "displayLeaderboard", null, {
        //callback: NebPay.testnetUrl,
        listener: onDisplayLeaderboard
    });
}

function onDisplayLeaderboard(resp) {
    var table_body = $('#leader-tbody')
    var headers = $('#headers')
    var html = '';
    if (resp) {
        table_body.html(headers);
        var response = JSON.parse(resp.result);
        for (var i = 0; i < response.length; i++) {
            html += '<tr>'
            html += '<td>' + (i + 1) + '</td>'; // leaderboard starts at 1, not 0
            html += '<td>' + response[i].username + '</td>';
            html += '<td>' + response[i].games_won + '</td>';
            html += '<td>' + response[i].games_played + '</td>';
            html += '<td>' + response[i].percentage  + '%</td>';
            html += '</tr>'
        }
        table_body.append(html);
    }
}