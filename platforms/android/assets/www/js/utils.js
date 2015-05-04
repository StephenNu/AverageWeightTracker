


function lastmonth() {
    var end = averagesList.length - 1;
    document.getElementById('lastmonth').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[(end - 30)].data) : "N/A");
}
function currentmonth() {
    var end = averagesList.length - 1;
    document.getElementById('currentmonth').innerHTML = '' + ((averagesList.length == 0) ? "N/A" : averagesList[end].data);
}
function lossweek() {
    var end = averagesList.length - 1;
    console.log('hello ' + end + " " + averagesList.length);
    document.getElementById('lossweek').innerHTML = '' + (((end - 7) >= 0) ? (averagesList[(end - 7)].data - averagesList[end].data) : "N/A");
}
function lossmonth() {
    var end = averagesList.length - 1;
    document.getElementById('lossmonth').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[(end - 30)].data - averagesList[end].data) : "N/A");
}
function monthpre() {
    var end = averagesList.length - 1;
    document.getElementById('monthpre').innerHTML = '' + (((end - 30) >= 0) ? (averagesList[end].data - (averagesList[(end - 30)].data - averagesList[end].data)) : "N/A");
}

function toArray(jsonObject) {
	var info = new Array();
	for (var i = 0; i < jsonObject.length; i++)
	{
		info.push(jsonObject[i].data);
	}
	return info;
}
function convert_yyyy_mm_dd_to_epoch(date)
{
        var split = date.split('-');
        var dateString = split[1] + '/' + split[2] + '/' + split[0] + " 01:00";
        return new Date(dateString).getTime();
}