var localDB = null;

function onPageLoad() {
    try {
        if (!window.openDatabase) {
            updateStatus("Error: DB not supported");
        }
        else {
            initializeDatabase();
            createTables();
            getRecordCount();
        }
    }
    catch (e) {
        if (e == 2) {
            updateStatus("Error: Invalid database version.");
        }
        else {
            updateStatus("Error: Unknown error " + e + ".");
        }
        return;
    }
}

function initializeDatabase() {
    var shortName = 'oneSolDb';
    var version = '1.0';
    var displayName = 'OneSolutionOfflineStore';
    var maxSize = 5 * 1024 * 1024; // in bytes
    localDB = window.openDatabase(shortName, version, displayName, maxSize);
}

function createTables() {
    var query1 = 'CREATE TABLE IF NOT EXISTS inspection(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, description VARCHAR NOT NULL, comment VARCHAR NOT NULL);';
    try {
        localDB.transaction(function (transaction) {
            transaction.executeSql(query1, [], nullDataHandler, errorHandler);
            updateStatus("Table 'inspection' is present");
        });
    }
    catch (e) {
        updateStatus("Error: Unable to create table 'inspection' " + e + ".");
        return;
    }
	var query2 = 'CREATE TABLE IF NOT EXISTS inspection_details(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, inspectionid INTEGER NOT NULL, type VARCHAR NOT NULL, paid VARCHAR NOT NULL);';
    try {
        localDB.transaction(function (transaction) {
            transaction.executeSql(query2, [], nullDataHandler, errorHandler);
            updateStatus("Table 'inspection_details' is present");
        });
    }
    catch (e) {
        updateStatus("Error: Unable to create table 'inspection_details' " + e + ".");
        return;
    }
}



function onInsertMultiple() {
	var query = "insert into inspection (description, comment) VALUES (?, ?);";
	for(var i=0; i< 1000; i++) {
		localDB.transaction(function (transaction) {
                transaction.executeSql(query, ["This is a test description " +i, "This is a test comment " +i], function (transaction, results) {
                    if (!results.rowsAffected) {
                        updateStatus("Error: No rows affected.");
						return;
                    }
                }, errorHandler);
            });
	}
	var query1 = "insert into inspection_details (inspectionid, type, paid) VALUES (?, ?, ?);";
	for(var i=0; i< 1000; i++) {
	localDB.transaction(function (transaction) {
			transaction.executeSql(query1, [i, "UNKNOWN " +i, "Y " +i], function (transaction, results) {
				if (!results.rowsAffected) {
					updateStatus("Error: No rows affected.");
					return;
				}
			}, errorHandler);
		});
	}
	getRecordCount();
}

function getRecordCount() {
    //read db data and create new table rows
    var query = "SELECT * FROM inspection;";
    try {
        localDB.transaction(function (transaction) {
            transaction.executeSql(query, [], function (transaction, results) {
				var status = results.rows.length + " records in inspectios table";
				document.getElementById('records').innerHTML = status;
	        }, function (transaction, error) {
                updateStatus("Error: " + error.code + "<br>Message: " + error.message);
            });
        });
    }
    catch (e) {
        updateStatus("Error: Unable to select data from the db " + e + ".");
    }
}

errorHandler = function (transaction, error) {
    updateStatus("Error: " + error.message);
    return true;
}

nullDataHandler = function (transaction, results) {
}

function updateStatus(status) {
    document.getElementById('status').innerHTML = status;
}