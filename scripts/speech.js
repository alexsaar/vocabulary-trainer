// Speech Example: https://www.google.com/intl/de/chrome/demos/speech.html

if (!('webkitSpeechRecognition' in window)) {
    showMsg('Web Speech API is not supported by this browser.');
} else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        showMsg('Speak now!');
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
    };
    
    recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
          showMsg('Click on the microphone icon and begin speaking for as long as you like.');
          return;
        }
        showMsg('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
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
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        console.log(linebreak(final_transcript));
        console.log(linebreak(interim_transcript));
    };
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
