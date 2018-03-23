window.appData = {
  recordId:[],
  fieldId:[],
  fieldInfo:[]
};

var client = ZAFClient.init();

client.context().then(function (context) {
  appData.context = context;
})



//BEGIN ALWAYS PRESENT

document.getElementById("reload_button").addEventListener("click", function(){
  location.reload(true);
})

//END ALWAYS PRESENT

//BEGIN SCREEN 1

document.getElementById("organizations_button").addEventListener("click", function(){
  appData.customerManagerMode = "organizations";
  loadActionScreen();
})

document.getElementById("users_button").addEventListener("click", function(){
  appData.customerManagerMode = "users";
  loadActionScreen();
})
//END SCREEN 1

//BEGIN SCREEN 2
function loadActionScreen(){
  document.getElementById("selection_screen").style.visibility = "hidden";
  document.getElementById("action_screen").style.visibility = "visible";
  console.log("Method: " + appData.customerManagerMode);
}

document.getElementById("delete_records_button").addEventListener("click", function(){
  appData.customerManagerActionType = "delete"
  selectMethodScreen(appData.customerManagerActionType);
})

document.getElementById("edit_records_button").addEventListener("click", function(){
  appData.customerManagerActionType = "edit"
  selectMethodScreen(appData.customerManagerActionType);
})
//END SCREEN 2

//BEGIN SCREEN 3
function selectMethodScreen(){
  document.getElementById("action_screen").style.visibility = "hidden";
  document.getElementById("method_screen").style.visibility = "visible";
  console.log("Action: " + appData.customerManagerActionType);
}

document.getElementById("manual_selection_button").addEventListener("click", function(){
  manualSelectionScreen();
})

document.getElementById("input_ids_button").addEventListener("click", function(){
  idSelectionScreen();
})

//END SCREEN 3

//BEGIN SCREEN 4 -  MANUAL SELECTION
function manualSelectionScreen(){
  document.getElementById("method_screen").style.visibility = "hidden";
  document.getElementById("manual_selection_screen").style.visibility = "visible";

  //Set request data
  var requestParameters = {
    url: 'https://' + appData.context.account.subdomain + '.zendesk.com/api/v2/' + appData.customerManagerMode +'.json?per_page=15',
    type: 'GET',
    dataType: 'text',
  };

  //Make request
  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      displayRecords(requestResults);
    })
  }


function displayRecords(requestResults){

  //Set next and previous page URLs
  appData.nextPage = requestResults.next_page;
  appData.previousPage = requestResults.previous_page;

  //Clear any data that might be in table
  document.getElementById("records_table").innerHTML = "";

  //Append to table
  for (var i = 0; i < requestResults[appData.customerManagerMode].length; i++) {
    //Get table
    var table = document.getElementById("records_table");
    //Make new row in the table
    var newRow = table.insertRow(0);
    //Add cell with record info to the new row
    var newCell = newRow.insertCell(0);
    newCell.id = requestResults[appData.customerManagerMode][i].id;
    newCell.onclick = function(){addRemoveRecord(this.id)};
    newCell.innerHTML = requestResults[appData.customerManagerMode][i].name;
  }

  //Highlight if record is already marked
  for (var i = 0; i < appData.recordId.length; i++) {
    var checkedRecord = document.getElementById(appData.recordId[i]);
    if (checkedRecord) {
      checkedRecord.style.backgroundColor = "#d9d9d9";
    }
  }
  paginationHandler();
}

function paginationHandler(){
  //Next page
  if (appData.nextPage == null) {
    document.getElementById("next_page_button").disabled = true;
  }
  else {
    document.getElementById("next_page_button").disabled = false;
  }

  //Previous page
  if (appData.previousPage == null) {
    document.getElementById("previous_page_button").disabled = true;
  }
  else {
    document.getElementById("previous_page_button").disabled = false;
  }
}

function addRemoveRecord(currentRecordId) {
  var currentRecordElement = document.getElementById(currentRecordId);
  //Variable to keep track if record is already selected
  var isFound = false;
  //If there is 0 selected records, always add the clicked one to the list
  if (appData.recordId.length == 0) {
    appData.recordId.push(currentRecordId);
    currentRecordElement.style.backgroundColor = "#d9d9d9";
  }
  //If there already are some records on the list, add new if ID hasn't been matched, otherwise remove the record from the list
  else {
    for (var i = 0; i < appData.recordId.length; i++) {
      if (appData.recordId[i] == currentRecordId) {
        appData.recordId.splice(i,1);
        isFound = true;
        currentRecordElement.style.backgroundColor = "transparent";
      }
    }
    if (isFound == false) {
      appData.recordId.push(currentRecordId);
      currentRecordElement.style.backgroundColor = "#d9d9d9";
    }
  }
  console.dir(appData.recordId);
}

document.getElementById("next_page_button").addEventListener("click", function(){
  var requestParameters = {
    url: appData.nextPage,
    type: 'GET',
    dataType: 'text',
  };

  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      displayRecords(requestResults);
    })
})

document.getElementById("previous_page_button").addEventListener("click", function(){
  var requestParameters = {
    url: appData.previousPage,
    type: 'GET',
    dataType: 'text',
  };

client.request(requestParameters).then(
  function (data) {
    //Parse data
    var requestResults = JSON.parse(data);
    displayRecords(requestResults);
  })
})

document.getElementById("choose_fields_button").addEventListener("click", function(){
  fieldsForEditScreen();
})
//END SCREEN 4 - MANUAL SELECTION

//BEGIN SCREEN 4 - INSERT IDS
function idSelectionScreen(){
  document.getElementById("method_screen").style.visibility = "hidden";
  document.getElementById("input_ids_screen").style.visibility = "visible";

}
//END SCREEN 4 - INSERT IDS

//BEGIN SCREEN 5 - FIELDS FOR EDITING
function fieldsForEditScreen(){
  document.getElementById("manual_selection_screen").style.visibility = "hidden";
  document.getElementById("choose_fields_screen").style.visibility = "visible";

  //Set proper record type name for API endpoint
  var customerManagerMode;
  if (appData.customerManagerMode == "organizations") {
    customerManagerMode = "organization";
  }
  else {
    customerManagerMode = "user";
  }

  //Set request data
  var requestParameters = {
    url: 'https://' + appData.context.account.subdomain + '.zendesk.com/api/v2/' + customerManagerMode +'_fields.json',
    type: 'GET',
    dataType: 'text',
  };

  //Make request
  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
        displayFields(requestResults);
    })
}

function displayFields(requestResults) {
  console.dir(requestResults);
  //Set proper record type name for API endpoint
  var customerManagerMode;
  if (appData.customerManagerMode == "organizations") {
    customerManagerMode = "organization_fields";
}
  else {
    customerManagerMode = "user_fields";
  }

  //Append to table
  for (var i = 0; i < requestResults[customerManagerMode].length; i++) {
    //Store field info for editing later on
    if (requestResults[customerManagerMode][i].active) {
      //Store field information for later use
      var fieldInformation = {
        name: requestResults[customerManagerMode][i].title,
        id: requestResults[customerManagerMode][i].id,
        type: requestResults[customerManagerMode][i].type,
        field_options: requestResults[customerManagerMode][i].custom_field_options
      }
  appData.fieldInfo.push(fieldInformation);
  //Get table
  var table = document.getElementById("choose_fields_table");
  //Make new row in the table
  var newRow = table.insertRow(0);
  //Add cell with record info to the new row
  var newCell = newRow.insertCell(0);
  newCell.id = requestResults[customerManagerMode][i].id;
  newCell.onclick = function(){addRemoveField(this.id)};
  newCell.innerHTML = requestResults[customerManagerMode][i].title;
  }
 }
}

function addRemoveField(currentField){
  var currentRecordElement = document.getElementById(currentField);

  //Variable to keep track if record is already selected
  var isFound = false;

  //If there is 0 selected fields, always add the clicked one to the list
  if (appData.fieldId.length == 0) {
    appData.fieldId.push(currentField);
    currentRecordElement.style.backgroundColor = "#d9d9d9";
  }
  //If there already are some fields on the list, add new if ID hasn't been matched, otherwise remove the field from the list
  else {
  for (var i = 0; i < appData.fieldId.length; i++) {
    if (appData.fieldId[i] == currentField) {
      appData.fieldId.splice(i,1);
        isFound = true;
          currentRecordElement.style.backgroundColor = "transparent";
    }
  }
    if (isFound == false) {
        appData.fieldId.push(currentField);
        currentRecordElement.style.backgroundColor = "#d9d9d9";
    }
  }
  console.dir(appData.fieldId);
}

document.getElementById("edit_fields_value_button").addEventListener("click", function(){
  defineFieldValues();
})

//END SCREEN 5 - FIELDS FOR EDITING

//BEGIN SCREEN 6 - DEFINE FIELD VALUES
function defineFieldValues(){
  document.getElementById("choose_fields_screen").style.visibility = "hidden";
  document.getElementById("edit_field_values_screen").style.visible = "visible";

  console.dir(appData.fieldInfo);

  // BUG: Fix getting object values
  for (var i = 0; i < appData.fieldId.length; i++) {
    for (var x = 0; i < appData.fieldInfo.length; x++) {
      if (appData.fieldId[i] == appData.fieldInfo][x].id) {
        var tempObject = appData.fieldInfo[x];
          drawFieldForEditing(tempObject);
      }
    }
  }
}

function drawFieldForEditing(fieldInfo){
  //Get table
  var table = document.getElementById("records_table");
  //Make new row in the table
  var newRow = table.insertRow(0);
  //Add cell with record info to the new row
  var newCell = newRow.insertCell(0);

  switch (fieldInfo) {
    case "textarea":
    break;
    case "checkbox":
    break;
    case "integer":
    break;
    case "decimal":
    break;
    case "regexp":
    break;
    case "dropdown":
    break;
    case "text":
    break;
    }
}
//END SCREEN 6 - DEFINE FIELD VALUES
