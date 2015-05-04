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

        var store = db.createObjectStore("averages", { keyPath: "timeStamp" });

    };

    request.onsuccess = function (e) {
        html5.indexedDB.db = e.target.result;
        html5.indexedDB.getAllWeights();
    };

    request.onerror = html5.indexedDB.onerror;

}

html5.indexedDB.addWeight = function (weight) {
    console.log('passed in weight = ' + weight);
    var db = html5.indexedDB.db;
    var trans = db.transaction(["averages"], "readwrite");
    var store = trans.objectStore("averages");
    var request = store.put({ "weight": weight, "timeStamp": new Date().getTime() });

    request.onsuccess = function (e) {
        html5.indexedDB.getAllWeights();
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
    averagesIDs = new Array();
    var cursorRequest = store.openCursor(keyRange);


    cursorRequest.onsuccess = function (e) {
        var result = e.target.result;
        if (!!result == false) {
            current = displayGraph("myChart",
							[new dataline("rgba(214,32,32,0)",
										"rgba(214,32,32,1)",
										"rgba(220,220,220,1)",
										"#fff",
										averagesList
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

        storeWeights(result.value);
        result.continue();
    };
    cursorRequest.onerror = function (e) {
        console.log('error getting all weights');
        html5.indexedDB.onerror();
    }
};

html5.indexedDB.deleteWeight = function (id) {
    var db = html5.indexedDB.db;
    var trans = db.transaction(["averages"], "readwrite");
    var store = trans.objectStore("averages");
    var request = store.delete(id);
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
function addWeight() {
    var weight = document.getElementById("weight");
    html5.indexedDB.addWeight(weight.value);
    weight.innerHTML = "";
}
function deleteWeight(weightID) {
    console.log("passing off delete " + weightID);
    html5.indexedDB.deleteWeight(weightID);
}
function storeWeights(row) {
    averagesIDs.push(row.timeStamp);
    averagesList.push(row.weight);
    console.log('done storing ' + row.weight);
}
/*
var dbCreated = false;

function startDatabase() {
    console.log("startdatabase1");
    try {
        if (window.openDatabase)
            db = window.openDatabase("weight_averagesDB", "1.0", "Weight Tracker", 200000);
        else
            console.log('not supported');
    }
    catch (e)
    {
        console.log('error');
    }
    console.log("startdatabase");
    //if (dbCreated)
     //  db.transaction(getWeights, transaction_error);
    //else
    //   db.transaction(populateDB, transaction_error, populateDB_success);
}

function transaction_error(tx, error) {
    alert("Database Error: " + error);
}

function populateDB_success() {
    dbCreated = true;
    db.transaction(getWeights, transaction_error);
}

function getWeights(tx) {
    console.log('hello getweights');
    var sql = "select averages, date " +
				"from weights";
    tx.executeSql(sql, [], getWeights_success);
}

function getWeights_success(tx, results) {
    var len = results.rows.length;
    for (var i = 0; i < len; i++) {
        var weight = results.rows.item(i);
        month1.push(weight.averages);
        console.log('' + weight.averages);
    }
    db = null;
}

function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS weights');
    var sql =
		"CREATE TABLE IF NOT EXISTS weights ( " +
		"date VARCHAR(20) PRIMARY KEY, " +
		"weight INTEGER " +
		")";
    tx.executeSql(sql);

    tx.executeSql("INSERT INTO weights (date, averages) VALUES (2012/03/27, 150)");
    tx.executeSql("INSERT INTO weights (date, averages) VALUES (2012/03/28, 140)");
    tx.executeSql("INSERT INTO weights (date, averages) VALUES (2012/03/29, 130)");
    tx.executeSql("INSERT INTO weights (date, averages) VALUES (2012/03/30, 125)");
}
*/