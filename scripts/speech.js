// Speech Example: https://www.google.com/intl/de/chrome/demos/speech.html

import { showMsg } from './util.js'
import { handleAnswer } from './script.js'

let recognition
let recognizing = false
let finalTranscript = ''
let startTimestamp

function isRecognizing () {
  return recognizing
}

if (!('webkitSpeechRecognition' in window)) {
  showMsg('Web Speech API is not supported by this browser.')
} else {
  recognition = new webkitSpeechRecognition() // eslint-disable-line
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onstart = function (event) {
    recognizing = true
    startTimestamp = event.timeStamp
    $('#mic-on').addClass('pulse')
    showMsg('Speak now to provide your answer!')
  }

  recognition.onerror = function (event) {
    if (event.error === 'no-speech') {
      showMsg('No speech was detected. You may need to adjust your microphone settings.')
    }
    if (event.error === 'audio-capture') {
      showMsg('No microphone was found. Ensure that a microphone is installed and that are configured correctly.')
    }
    if (event.error === 'not-allowed') {
      if (event.timeStamp - startTimestamp < 100) {
        showMsg('Permission to use microphone is blocked. To change, go to chrome://settings/contentExceptions#media-stream')
      } else {
        showMsg('Permission to use microphone was denied.')
      }
    }
    $('#mic-on').removeClass('pulse')
  }

  recognition.onend = function () {
    recognizing = false
    $('#mic-on').removeClass('pulse')
  }

  recognition.onresult = function (event) {
    if (typeof (event.results) === 'undefined') {
      recognition.onend = null
      recognition.stop()
      showMsg('Web Speech API is not supported by this browser.')
      return
    }
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript
        handleAnswer(finalTranscript)
        finalTranscript = ''
      }
    }
  }
}

function toggleSpeechRecognition (lang) {
  // start speech recognition
  if (isRecognizing()) {
    recognition.stop()
    return
  }
  finalTranscript = ''
  recognition.lang = lang
  recognition.start()
}

export { recognition, isRecognizing, toggleSpeechRecognition }
