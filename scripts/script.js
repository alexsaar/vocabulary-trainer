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

async function getVocabulary() {
    let docID = $('#sheet').val().match(/\w{30,}/);
    
    let result;
    try {
        return await $.get(API_URL + docID + "/values/" + tab + "!A:B", { key: API_KEY });
    } catch (error) {
        showMsg("Woops! Something whent wrong! Please check that you provide a valid Google Sheet URL and that your document is public.");
    }
}

function prepareResults(vocabulary) {
    // create header
    $('#content').html("<div id='vocabulary'>"
        + "<div class='header'>Word</div>"
        + "<div class='header'>Your answer</div>"
        + "<div class='header'>Result</div></div>");

    // add vocabulary entries
    $.each(vocabulary.values.slice(1), function(i, item) {
        let voc = $('#vocabulary');
        voc.append(`<div id=v${i} class='line word'>${item[0]}</div>`);
        voc.append(`<div id=t${i} class='line answer'></div>`);
        voc.append(`<div id=a${i} class='line result'>${item[1]}</div>`);
    });
    $('#vocabulary .word').first().css('opacity', 1);

    // retrieve target language
    if (vocabulary.values[0] && vocabulary.values[0][1]) {
        lang = vocabulary.values[0][1];
    }
}

function startSpeechRecognition() {
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

async function startLearning() {
    showMsg("Preparing your test");
    $('#content').html("");
    
    let vocabulary = await getVocabulary();
    if (vocabulary) {
        prepareResults(vocabulary)
        startSpeechRecognition();
    }
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

// process request params
let params = new URLSearchParams(window.location.search)
if (params.has('tab')) {
    tab = params.get('tab');
}
if (params.has('sheet')) {
    document.getElementById('sheet').value = params.get('sheet');
    startLearning();
}
