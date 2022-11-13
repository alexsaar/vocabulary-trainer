// Google API key and URL
const API_KEY = 'AIzaSyCgyvKMsB4BSrP9fuo2Ev7o-TMDiw8BlNI';
const API_URL = 'https://sheets.googleapis.com/v4/spreadsheets/';
const tada = new Audio('/res/sound/tada.mp3');

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function showMsg(msg) {
    $('#msg').text(msg);
}

let learningStats;
let lang = 'en-GB';
let tab = 'Vocabulary';

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
    $('#vocabulary').html("<div class='header'>Word</div>"
        + "<div class='header'>Your answer</div>"
        + "<div class='header'>Result</div>"
        + "<div class='header' style='display:none'>Expected</div>");

    // add vocabulary entries
    $.each(shuffle(vocabulary.values.slice(1)), function(i, item) {
        let voc = $('#vocabulary');
        voc.append(`<div id=w${i} class='line word'>${item[0]}</div>`);
        voc.append(`<div id=a${i} class='line answer'></div>`);
        voc.append(`<div id=r${i} class='line result'></div>`);
        voc.append(`<div id=e${i} class='line expected' style='display:none'>${item[1]}</div>`);
        learningStats.tests++;
    });
    $('#vocabulary .word').first().css({'opacity': 1, 'display': 'block'});

    // retrieve target language
    if (vocabulary.values[0] && vocabulary.values[0][1]) {
        lang = vocabulary.values[0][1];
    }
}

function toggleSpeechRecognition() {
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

function handleAnswer(answer) {
    let i = (learningStats.index);

    answer = answer.trim();
    if (answer !== "") {
        if (!isNaN(answer)) {
            answer = inWords(answer);
        }
        $("#a" + i).html(answer).css({'opacity': 1, 'display': 'block'});
        
        let offset = window.scrollY + $("#a" + i).height() + 24; // don't forget to add row gap
        let expected = $("#e" + i).text().trim().toLowerCase();
        answer = $("#a" + i).text().trim().toLowerCase();
        if (answer === expected) {
            $("#r" + i).html("Correct!").css({'opacity': 1, 'display': 'block'});
            $('html, body').animate({ scrollTop: offset });
            $("#w" + (i+1)).css({'opacity': 1, 'display': 'block'});
            learningStats.index++;
            learningStats.hits++;
            learningStats.retries = 0;
        } else {
            if (learningStats.retries > 3) {
                $("#r" + i).html("Not correct!").css({'opacity': 1, 'display': 'block'});
                $('html, body').animate({ scrollTop: offset });
                $("#w" + (i+1)).css({'opacity': 1, 'display': 'block'});
                learningStats.index++;
                learningStats.misses++;
                learningStats.retries = 0;
            } else {
                $("#r" + i).html("Try again!").css({'opacity': 1, 'display': 'block'});
                learningStats.retries++;
            }
        }
        if (learningStats.index == learningStats.tests) {
            finishLearning();
        }
    }
}

async function startLearning() {
    showMsg("Preparing your test");
    $('#content').html("");
    
    let vocabulary = await getVocabulary();
    if (vocabulary) {
        learningStats = { tests:0, index:0, hits:0, misses:0, retries: 0 }
        prepareResults(vocabulary)
        toggleSpeechRecognition();
    }
}

function finishLearning() {
    document.body.scrollIntoView({ behavior: "smooth", block: "start" })
    let percentage = Math.round(learningStats.hits / learningStats.tests * 100);
    showMsg(`Congratulations! You achieved ${percentage}% with ${learningStats.hits} correct answers out of ${learningStats.tests}.`);
    toggleSpeechRecognition();
    tada.play();
}

// register listeners
$("#start").on("click", function(event) {
    if (recognizing) {
        finishLearning();
    } else {
        startLearning();
    }
});
$('#sheet').on("keypress", function(event) {
    if (event.code == 'Enter') {
        startLearning();
    }
});
document.addEventListener('scroll', (e) => {
    let btn = $('#start');
    let inputs = $('#inputs');
    if (isElementInViewport(inputs[0]) && btn.hasClass('float')) {
        btn.removeClass('float');
    } else if (!isElementInViewport(inputs[0]) && !btn.hasClass('float)')) {
        btn.addClass('float');
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
