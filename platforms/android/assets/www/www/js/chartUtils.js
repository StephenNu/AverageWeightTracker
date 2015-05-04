
function dataline(fillColor, strokeColor, pointColor, pointStrokeColor, data) {
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;
    this.pointColor = pointColor;
    this.pointStrokeColor = pointStrokeColor;
    this.data = data;
}
function resizeCanvas(id) {
    var c = document.getElementById(id);
    var div = document.getElementById(id + "container");
    c.width = div.clientWidth;
    c.height = ((2/3)*div.clientWidth < div.clientHeight) ? ((2/3)*div.clientWidth) : div.clientHeight;

}
function displayGraph(id, datadisplay) {

    var c = document.getElementById(id);
    resizeCanvas(id);
    var ctx = c.getContext("2d");
    var data = {
        labels: [],
        datasets: []
    }
    var information = new Array();
    for (var i = 0; i < datadisplay[0].data.length; i++) {
        data.labels.push("");
    }
    for (var i = 0; i < datadisplay.length; i++) {
        data.datasets.push(
            new dataline(
                datadisplay[i].fillColor, datadisplay[i].strokeColor,
                datadisplay[i].pointColor, datadisplay[i].pointStrokeColor,
                datadisplay[i].data
            )
        );
    }
    new Chart(ctx).Line(data);
    resizing = false;
    console.log('exiting display');
    return data.datasets;
}