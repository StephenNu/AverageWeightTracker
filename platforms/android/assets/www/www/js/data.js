var averagesList = [];
var weightsList = [];
var current = [new dataline(
                            "rgba(214,32,32,0)",
                            "rgba(220,220,220,0)",
                            "rgba(220,220,220,0)",
                            "#fff",
                            []
                            )
              ]
;
var resizing = false;
var lastModifiedCurser = null;
var client = null;
var CONVERT_SECS_TO_DAYS = 1000*60*60*24;

var DEBUGING_TIME = 1;
var debug = true;
var cloudTime = null;
var weiUpdate = false;
var avgUpdate = false;
var redisplay = true;