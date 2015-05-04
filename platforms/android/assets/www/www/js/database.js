var html5 = {};
html5.indexedDB = {};

html5.indexedDB.db = null;

html5.indexedDB.open = function () {
    var version = 1;
    var request = indexedDB.open("weightaverages", version);
    request.onupgradeneeded = function (e) {
        console.log('upgrading');
        var db = e.target.result;

        e.target.transaction.onerror = html5.indexedDB.onerror;

        if (db.objectStoreNames.contains("averages")) {
            db.deleteObjectStore("averages");
        }

        if (db.objectStoreNames.contains("weights")) {
            db.deleteObjectStore("weights");
        }

        if (db.objectStoreNames.contains("timeModified")) {
            db.deleteObjectStore("timeModified");
        }
        var store = db.createObjectStore("averages", { keyPath: "timeStamp" });
        var store2 = db.createObjectStore("weights", { keyPath: "timeStamp" });
        var store3 = db.createObjectStore("timeModified", { keyPath: "timeStamp" });

    };

    request.onsuccess = function (e) {
        html5.indexedDB.db = e.target.result;
        html5.indexedDB.getAllWeights();
    };

    request.onerror = html5.indexedDB.onerror;

}

html5.indexedDB.addWeight = function (weight, t) {
	if (t == undefined)
	{
	    t = new Date().getTime();
	}
    var db = html5.indexedDB.db;
    var trans = db.transaction(["weights"], "readwrite");
    var store = trans.objectStore("weights");
    var completed = 0;
	var Aend = averagesList.length - 1;
    var avg = weight;
    if (Aend >= 0)
    {
    	avg = 0.1*weight + 0.9*averagesList[Aend].data;
    }
    if (debug)
    {
    	console.log('time = ' + DEBUGING_TIME);
        var storeWeight = { "data": weight, "timeStamp": DEBUGING_TIME };
        var storeAverage = { "data": avg, "timeStamp": DEBUGING_TIME };
    	var storeTime = {"timeStamp": (DEBUGING_TIME*CONVERT_SECS_TO_DAYS)};
    }
    else
    {
    	var storeWeight = { "data": weight, "timeStamp": t/CONVERT_SECS_TO_DAYS };
    	var storeAverage = { "data": avg, "timeStamp": t/CONVERT_SECS_TO_DAYS };
    	var storeTime = {"timeStamp": t};
    }
    var request = store.put(storeWeight);
    // TODO: remove comment below to enable unique per day.
    //var request = store.put({ "weight": avg, "timeStamp": Math.floor(t/CONVERT_SECS_TO_DAYS) });
    console.log('weight = ' + weight);
    
    request.onsuccess = function (e) {
        var trans2 = db.transaction(["averages"], "readwrite");
        var store2 = trans2.objectStore("averages");
        var request2 = store2.put(storeAverage);
        // TODO: remove comment below to enable unique per day.
        //var request2 = store2.put({ "average": avg, "timeStamp": Math.floor(t/CONVERT_SECS_TO_DAYS) });
        
        request2.onsuccess = function (e) {
            var trans3 = db.transaction(["timeModified"], "readwrite");
            var store3 = trans3.objectStore("timeModified");
            var request3 = store3.put(storeTime);
            
            request3.onsuccess = function (e) {
            	var Aend = averagesList.length - 1;
            	if (Aend >= 0 && averagesList[Aend].timeStamp == storeAverage.timeStamp)
            	{
            		averagesList[Aend] = storeAverage;
            		weightsList[Aend] = storeWeight;
            	}
            	else
            	{
            		if (Aend >= 0)
            		{
            			fillHoles(Aend,storeWeight);
            		}
            		console.log('storing ' + storeWeight.data + ' ' + storeWeight.timeStamp);
                	storeAvgWeights(storeAverage);
                	storeWeights(storeWeight);
            		
            	}
            	sync();
            	if (redisplay)
            	{

            		weightsList.sort(function(a,b) { return parseFloat(a.timeStamp) > parseFloat(b.timeStamp) } );
            		averagesList.sort(function(a,b) { return parseFloat(a.timeStamp) > parseFloat(b.timeStamp) } );
            		var end = averagesList.length - 1;
            		current = displayGraph("myChart",
							[new dataline("rgba(214,32,32,0)",
										"rgba(214,32,32,1)",
										"rgba(220,220,220,1)",
										"#fff",
										((end - 30 >= 0) ? toArray(averagesList.slice(end - 30)) : toArray(averagesList))
										),
							new dataline("rgba(214,214,32,0)",
									"rgba(214,214,32,0)",
									"rgba(214,214,32,1)",
									"#fff",
									((end - 30 >= 0) ? toArray(weightsList.slice(end - 30)) : toArray(weightsList))
									)
							]
				);
		         monthpre();
		         lastmonth();
		         currentmonth();
		         lossweek();
		         lossmonth();
            	}
            };
            request3.onerror = function (e) {
            };
        };
        request2.onerror = function (e) {
        };
    };
    request.onerror = function (e) {
    };
}

html5.indexedDB.getAllWeights = function () {
    var db = html5.indexedDB.db;
    var trans = db.transaction(["averages"], "readwrite");
    var store = trans.objectStore("averages");

    var keyRange = IDBKeyRange.lowerBound(0);
    averagesList = new Array();
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function (e) {
        var result = e.target.result;
        if (!!result == false) {

            weightsList = new Array();
            var trans2 = db.transaction(["weights"], "readwrite");
            var store2 = trans2.objectStore("weights");
            var keyRange2 = IDBKeyRange.lowerBound(0);
        	var cursorRequest2 = store2.openCursor(keyRange2);


            cursorRequest2.onsuccess = function (e2) {
                var result2 = e2.target.result;
                if (!!result2 == false) {
                	var end = averagesList.length -1;
                	averagesList.sort(function(a,b) { return parseFloat(a.timeStamp) > parseFloat(b.timeStamp)  });
                	weightsList.sort(function(a,b) { return parseFloat(a.timeStamp) > parseFloat(b.timeStamp)  });
                    current = displayGraph("myChart",
                    		[new dataline("rgba(214,32,32,0)",
									"rgba(214,32,32,1)",
									"rgba(220,220,220,1)",
									"#fff",
									((end - 30 >= 0) ? toArray(averagesList.slice(end - 30)) : toArray(averagesList))
									),
							new dataline("rgba(214,214,32,0)",
									"rgba(214,214,32,0)",
									"rgba(214,214,32,1)",
									"#fff",
									((end - 30 >= 0) ? toArray(weightsList.slice(end - 30)) : toArray(weightsList))
									)
							]
        				);
                    monthpre();
                    lastmonth();
                    currentmonth();
                    lossweek();
                    lossmonth();
                    return;
                }
                storeWeights(result2.value);
                result2.continue();
            };
            cursorRequest2.onerror = function (e) {
                console.log('error getting all weights');
                html5.indexedDB.onerror();
            };
            return;
        }
        storeAvgWeights(result.value);
        result.continue();
    };
    cursorRequest.onerror = function (e) {
        console.log('error getting all averages');
        html5.indexedDB.onerror();
    };
};

html5.indexedDB.deleteWeight = function (Wid, Aid) {
    var db = html5.indexedDB.db;
    var trans = db.transaction(["averages"], "readwrite");
    var store = trans.objectStore("averages");
    var request = store.delete(Aid);
    request.onsuccess = function (e) {
        setTimeout(function () { console.log('going to call after delete'); html5.indexedDB.getAllWeights(); }, 2000);
    };
    request.onerror = function(e) {
        console.log('deleting ' + e);
    };
};
function databaseInit() {
    html5.indexedDB.open();
}
function fillHoles(start, newDay) {
	var initialWeight = parseFloat(weightsList[start].data);
	var initialDay = parseFloat(weightsList[start].timeStamp);
	var missedDays = parseFloat(newDay.timeStamp) - initialDay;
	var gradient = (parseFloat(newDay.data) - initialWeight)/missedDays;
	for (var i = 1; i < missedDays; i++)
	{
		if (i + 1 == missedDays)
		{
			redisplay = true;
		}
		else
		{
			redisplay = false;
		}
		var wei = initialWeight + gradient*i;
		var day = initialDay + i;

		if (debug)
		{
			DEBUGING_TIME = day
		}
		console.log('adding to fill ' + wei + ' at day ' + day);
		html5.indexedDB.addWeight(wei, day);
	}
}
function addWeight() {
    var weights = document.getElementById("weight");
    DEBUGING_TIME = document.getElementById('date').value;
    html5.indexedDB.addWeight(weights.value);
    weights.innerHTML = "";
}
function deleteWeight(weightID, AverageID) {
    console.log("passing off delete " + weightID);
    html5.indexedDB.deleteWeight(weightID, AverageID);
}

function storeWeights(row) {
	weightsList.push(row);
}
function storeAvgWeights(row) {
    averagesList.push(row);
}

function putWeiNext(weiItems, i , errors, store)
{
	
	console.log('putting next weight');
	if (i < weiItems.length)
	{
		console.log('' + i + ' ' + weiItems[i].time);
		var request = store.put({data: weiItems[i].weight, timeStamp: weiItems[i].time});
		++i;
		request.onsuccess = putWeiNext(weiItems, i, errors, store);
		request.onerror = function()
		{
			errors++;
			if (errors < 3)
			{
				--i;
			}
			else
			{
				errors = 0;
			}
			putWeiNext(weiItems, i , errors, store);
			console.log('error number ' + errors + ' occured');
		}
	}
	else
	{
		weiUpdate = true;
		console.log("finished inserting server weight data");
	}
	
}

function putAvgNext(avgItems, i , errors, store)
{
	
	console.log('putting next average');
	if (i < avgItems.length)
	{
		console.log('' + i + ' ' + avgItems[i].time);
		var request = store.put({data: avgItems[i].average, timeStamp: avgItems[i].time});
		++i;
		request.onsuccess = putAvgNext(avgItems, i, errors, store);
		request.onerror = function()
		{
			errors++;
			if (errors < 3)
			{
				--i;
			}
			else
			{
				errors = 0;
			}
			putAvgNext(avgItems, i , errors, store);
			console.log('error number ' + errors + ' occured');
		}
	}
	else
	{
		avgUpdate = true;
		console.log("finished inserting server average data");
	}
	
}
function updateFromServer(cloud) {
	console.log('server is newer');
	var cloudAveragesTable = client.getTable('averages');
	var averagesQuery = cloudAveragesTable.where(
		function() 
		{ 
			return this.userId == client.currentUser.userId; 
		}
	);
	averagesQuery.read().then(function(avgItems) {
	    var db = html5.indexedDB.db;
    	var trans = db.transaction(["averages"], "readwrite");
    	var store = trans.objectStore("averages");
		putAvgNext(avgItems, 0, 0, store);
	}, function () { 
		console.log('no average data for user found');
		
	});
	var cloudWeightsTable = client.getTable('weights');
	var weightsQuery = cloudWeightsTable.where(
		function() 
		{ 
			return this.userId == client.currentUser.userId; 
		}
	);
	weightsQuery.read().then(function(weiItems) {
	    var db = html5.indexedDB.db;
    	var trans = db.transaction(["weights"], "readwrite");
    	var store = trans.objectStore("weights");
		putWeiNext(weiItems, 0, 0, store);
	}, function () { 
		console.log('no weight data for user found');
		
	});

    if (lastModifiedCurser !== null)
	{
		lastModifiedCurser.value.timeStamp = cloudTime;
		lastModifiedCurser.update(lastModifiedCurser.value);
	}
    else
    {
    	var db = html5.indexDB.db;
    	var trans = db.transaction(["timeModified"], "readwrite");
    	var store = trans.objectStore("timeModified");
    	var request = store.put({timeStamp: cloudTime});
    	request.onerror = function()
    	{
    		console.log('error putting in server modified time');
    	}
    }
}
function updateFromLocal(cloud) {
	console.log('local is newer');
	/*cloudTime = cloud.time;
	var id = Math.floor((cloudTime)/CONVERT_SECS_TO_DAYS);
	var index = averagesIDs.length -1;
	if (index < 0)
	{
		return;
	}
	for (; averagesIDs[index] != id && index >= 0; index--);
	var current = index;
	var averagesCloud = client.getTable('averages');
	var averagesQuery = averagesCloud.where(function() { return this.time == cloudTime/CONVERT_SECS_TO_DAYS && this.userId == client.currentUser.userId; });
	averagesQuery.read().then(function(recentAvg) 
			{
				if (recentAvg.length != 1)
				{
					console.log('we got two averages on a single day, unexpected error');
				}
				averagesCloud.update({id: recentAvg[0].id, average: averagesList[current]});
			}, 
			function() 
			{
				console.log('no recent data on the server, really unexpected error');
			}
	);
	var weightsCloud = client.getTable('weights');
	var weightsQuery = weightsCloud.where(function() { return this.time == cloudTime/CONVERT_SECS_TO_DAYS && this.userId == client.currentUser.userId;});
	weightsQuery.read().then(function(recentWei) 
			{
				if (recentWei.length != 1)
				{
					console.log('we got two averages on a single day, unexpected error');
				}
				averagesCloud.update({id: recentWei[0].id, average: averagesList[current]});
			}, 
			function() 
			{
				console.log('no recent data on the server, really unexpected error');
			}
	);
	index++;
	for (; index < averagesList.length; index++)
	{
		storeAvgs = { userId: client.currentUser.userId, average: averagesList[index], time: averagesIDs[index] };
		storeWeights = { userId: client.currentUser.userId, weight: weightsList[index], time: weightsIDs[index] };
    	console.log('pushing values');
        client.getTable("averages").insert(storeAvgs);
        client.getTable("weights").insert(storeWeights);
	}*/
}
function sync()
{
	if (client.currentUser == null || client.currentUser == undefined)
		return;
	console.log("syncing now");
	var cloudTimeTable = client.getTable('timeModified');
	var cloudQuery = cloudTimeTable.where(function() { return this.userId == client.currentUser.userId });
	cloudQuery.read().then(function(timeItem) {
	    
		var db = html5.indexedDB.db;
	    var trans = db.transaction(["timeModified"], "readwrite");
	    var store = trans.objectStore("timeModified");


        var keyRange = IDBKeyRange.upperBound(new Date().getTime());
    	var cursorRequest = store.openCursor(keyRange, "prev");


        cursorRequest.onsuccess = function (e) {
            var result = e.target.result;

            if (timeItem.length == 0)
    	    {
            	if (result !== null)
            		pushAll(0, result.key);
            	else
            		pushAll(0, new Date().getTime());
    	    	return;
    	    }
            if (!!result == false) {
            	updateFromServer(timeItem[0]);
            	console.log('in timeItem[0].time = ' + timeItem[0].time);
            	console.log('we have an empty cursor');
                return;
            }
            console.log('walking = ' + result.key + ' ---- ' + result.value.timeStamp);
        	lastModifiedCurser = result;
        	console.log('result = ' + result.key + ' timeItem[0].time = ' + timeItem[0].time);
            if (result.key >= timeItem[0].time)
            {
            	updateFromLocal(timeItem[0]);
            	pushAll(0, result.key);
            	return;
            	// local database is newer 
            	//update timeItem[0].id
            }
            else
            {

            	updateFromServer(timeItem[0]);
            	// server database is newer 
            	//update timeItem[0].id
            }
            while (!avgUpdate || !weiUpdate);
            
            console.log('displaying');
            avgUpdate = false;
            weiUpdate = false;
            html5.indexedDB.getAllWeights();
        };
        cursorRequest.onerror = function (e) {
            console.log('error getting latest modification time');
            html5.indexedDB.onerror();
        };
	}, function () { 
		console.log('no data for user found');
		
		var db = html5.indexedDB.db;
	    var trans = db.transaction(["timeModified"], "readwrite");
	    var store = trans.objectStore("timeModified");


        var keyRange = IDBKeyRange.upperBound(new Date().getTime());
    	var cursorRequest = store.openCursor(keyRange, "prev");


        cursorRequest.onsuccess = function (e) {
            var result = e.target.result;
            if (!!result == false) {
        		pushAll(0, new Date().getTime());
                return;
            }
    		pushAll(0, result.key);
            
        };
        cursorRequest.onerror = function (e) {
            console.log('error getting latest modification time');
            html5.indexedDB.onerror();
    		pushAll(0, new Date().getTime());
        };
		
	});
}
function pushAll(index, time2)
{
	var storeAvgs;
	var storeWeights;
	var i = index
	for (; i < averagesList.length; i++)
	{
		storeAvgs = { userId: client.currentUser.userId, average: averagesList[i].data, time: averagesList[i].timeStamp };
		storeWeights = { userId: client.currentUser.userId, weight: weightsList[i].data, time: weightsList[i].timeStamp  };
    	console.log('pushing values W('+weightsList[i].timeStamp  +')' + weightsList[i].data + ' A(' + averagesList[i].timeStamp  + ') = ' + averagesList[i].data);
        client.getTable("averages").insert(storeAvgs);
        client.getTable("weights").insert(storeWeights);
	}
	if (i > index)
	{
		var dateModified = { userId: client.currentUser.userId, time: time2 };
		client.getTable('timeModified').insert(dateModified);
	}
}

function loadDatabase(evt)
{

        var files = evt.target.files;
        console.log(files);
        console.log(files[0]);
        var reader = new FileReader();
        reader.onload = function (e) {
                var contents = e.target.result;
                console.log(contents);
                var results = $.csv.toArrays(contents);
                var jsonArray = new Array();
                for (var i = 1; i < results.length; i++)
                {
                                jsonArray.push({timeStamp: convert_yyyy_mm_dd_to_epoch(results[i][0]), data: results[i][1] });
                }
                for (var j = 0; j < jsonArray.length; j++)
                {
                        console.log(JSON.stringify(jsonArray[j]));
                }
        };
        reader.readAsText(files[0]);
} 
