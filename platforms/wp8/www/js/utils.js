function lastmonth() {
    var end = averagesList.length - 1;
    document.getElementById('lastmonth').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[(end - 30)]) : "N/A");
}
function currentmonth() {
    var end = averagesList.length - 1;
    document.getElementById('currentmonth').innerHTML = '' + ((averagesList.length == 0) ? "N/A" : averagesList[end]);
}
function lossweek() {
    var end = averagesList.length - 1;
    console.log('hello ' + end + " " + averagesList.length);
    document.getElementById('lossweek').innerHTML = '' + (((end - 7) >= 0) ? (averagesList[(end - 7)] - averagesList[end]) : "N/A");
}
function lossmonth() {
    var end = averagesList.length - 1;
    document.getElementById('lossmonth').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[(end - 30)] - averagesList[end]) : "N/A");
}
function monthpre() {
    var end = averagesList.length - 1;
    document.getElementById('monthpre').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[end] - (averagesList[(end - 30)] - averagesList[end])) : "N/A");
}