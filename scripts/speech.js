// Speech Example: https://www.google.com/intl/de/chrome/demos/speech.html

import { showMsg } from "./util.js"
import { handleAnswer } from "./script.js"

let recognition;
let recognizing = false;
let final_transcript = '';
let ignore_onend = true;

function isRecognizing () {
    return recognizing;
}

function resetTranscript() {
    final_transcript = '';
}

if (!('webkitSpeechRecognition' in window)) {
    showMsg('Web Speech API is not supported by this browser.');
} else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        $('#mic-on').addClass("pulse");
        showMsg('Speak now to provide your answer!')
    };
    
    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            showMsg('No speech was detected. You may need to adjust your microphone settings.');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            showMsg('No microphone was found. Ensure that a microphone is installed and that are configured correctly.');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showMsg('Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream');
            } else {
                showMsg('Permission to use microphone was denied.');
            }
            ignore_onend = true;
        }
        $('#mic-on').removeClass("pulse");
    };
    
    recognition.onend = function() {
        recognizing = false;
        $('#mic-on').removeClass("pulse");
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
          return;
        }
    };
    
    recognition.onresult = function(event) {
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            showMsg('Web Speech API is not supported by this browser.');
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                handleAnswer(final_transcript);
                final_transcript = "";
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
    };
}

function toggleSpeechRecognition(lang) {
    // start speech recognition
    if (isRecognizing()) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = lang;
    recognition.start();
    ignore_onend = false;
}

export { recognition, isRecognizing, toggleSpeechRecognition }
