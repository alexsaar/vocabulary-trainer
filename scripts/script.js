// Google API key and URL
const API_KEY = 'AIzaSyCgyvKMsB4BSrP9fuo2Ev7o-TMDiw8BlNI';
const API_URL = 'https://sheets.googleapis.com/v4/spreadsheets/';

function showMsg(msg) {
    $('#msg').text(msg);
}

let lang = 'en-GB';
let tab = 'Vocabulary';
let recognizing = false;
let final_transcript = '';

function startLearning() {
    showMsg("");

    // get vocabulary from sheet
    let docID = $('#sheet').val().match(/\w{30,}/);
    $.get(API_URL + docID + "/values/" + tab + "!A:B", { key: API_KEY }, 
        function(data) {
            
            // create header
            $('#content').html("<div id='vocabulary'>"
                + "<div class='header'>Word</div>"
                + "<div class='header'>Your answer</div>"
                + "<div class='header'>Result</div></div>");
            
            // add vocabulary entries
            $.each(data.values.slice(1), function(i, item) {
                let voc = $('#vocabulary');
                voc.append(`<div id=v${i} class='line word'>${item[0]}</div>`);
                voc.append(`<div id=t${i} class='line answer'></div>`);
                voc.append(`<div id=a${i} class='line result'>${item[1]}</div>`);
            });
            $('#vocabulary .word').first().css('opacity', 1);

            // retriev target language
            if (data.values[0] && data.values[0][1]) {
                lang = data.values[0][1];
            }

            // start speech recognition
            if (recognizing) {
                recognition.stop();
                return;
            }
            final_transcript = '';
            recognition.lang = lang;
            recognition.start();
            ignore_onend = false;
        }
    ).fail(function(){
        showMsg("Woops! Something whent wrong! Please check that you provide a valid Google Sheet URL and that your document is public.");
    });
}

// register listeners
$("#start").on("click", function(event) {
    startLearning();
});
$('#sheet').on("keypress", function(event) {
    if (event.code == 'Enter') {
        startLearning();
    }
});
$('#mic-on').on("click", function(event) {
    $(event.target).toggleClass("pulse");
});

// process request params
let params = new URLSearchParams(window.location.search)
if (params.has('tab')) {
    tab = params.get('tab');
}
if (params.has('sheet')) {
    document.getElementById('sheet').value = params.get('sheet');
    startLearning();
}
