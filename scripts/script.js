// Speech Example: https://www.google.com/intl/de/chrome/demos/speech.html

// Google API key and URL
const API_KEY = 'AIzaSyCgyvKMsB4BSrP9fuo2Ev7o-TMDiw8BlNI';
const API_URL = 'https://sheets.googleapis.com/v4/spreadsheets/';

function startTest() {
    let docID = $('#sheet').val().match(/\w{30,}/);
    $.get(API_URL + docID + "/values/Vocabulary!A2:B", { key: API_KEY }, 
    function(data) {
        $('#main').html("<div id='vocabulary'></div>");
        $.each(data.values, function(i, item) {
            $('#vocabulary').append("<div id=v" + i + ">" + item[0] + "</div>");
            $('#vocabulary').append("<div id=t" + i + ">" + item[1] + "</div>");
            $('#vocabulary').append("<div id=a" + i + "></div>");
        });
    }
).fail(function(){
    $('#main').text("Woops! Something whent wrong! Please check that you provide a valid Google Sheet URL and that your document is public.");
});
}

$("#start").click(function(){
    startTest();
}); 