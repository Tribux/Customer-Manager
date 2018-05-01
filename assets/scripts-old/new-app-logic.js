"use strict"

//OBJECTS

//Contains configuration data and API call procedures
var cManager = {
  subdomain : null,
  record_type: null,
  action: null,
  method: null,
  records: [null],
  fields: [],
  picked_fields: [],
  Get: {

    Subdomain: function(){
        return (client.context().then(function(context){
        return context.account.subdomain;
        })
      )
    },

    Fields: function(){
        var requestParameters = {
          url: 'https://' + cManager.subdomain + '.zendesk.com/api/v2/' + cManager.record_type +'_fields.json',
          type: 'GET',
          dataType: 'text'
      };
      return (client.request(requestParameters).then(function (data) {
          var requestResults = JSON.parse(data);
          return requestResults;
        }));
    },

    Records: function(){
      var requestParameters = {
        url: 'https://'+ cManager.subdomain +'.zendesk.com/api/v2/' + cManager.record_type +'s.json?per_page=20',
        type: 'GET',
        dataType: 'text'
      };
      return (client.request(requestParameters).then(function (data) {
          var requestResults = JSON.parse(data);
          return requestResults;
        }));
    },
    RecordsNextPage: function(nextPageUrl){
      var requestParameters = {
        url: nextPageUrl,
        type: 'GET',
        dataType: 'text'
      };
      return (client.request(requestParameters).then(function (data) {
          var requestResults = JSON.parse(data);
          return requestResults;
        }));
    },
    RecordsPreviousPage: function(previousPageUrl){
      var requestParameters = {
        url: previousPageUrl,
        type: 'GET',
        dataType: 'text'
      };
      return (client.request(requestParameters).then(function (data) {
          var requestResults = JSON.parse(data);
          return requestResults;
        }));
    }

  },

  Set: {
    RecordType: function(eventInfo){
      cManager.record_type = eventInfo.value;
      console.log("Record type: " + cManager.record_type);
      validateConfiguration();
    },
    ActionType: function(eventInfo){
      cManager.action = eventInfo.value;
      console.log("Action type: " + cManager.action);
      validateConfiguration();
    },
    MethodType: function(eventInfo){
      cManager.method = eventInfo.value;
      console.log("Method type: " + cManager.method);
      validateConfiguration();
    }
  },
  Add: {
    Fields: function(eventInfo){
      var isAlreadyFound = false;
      for (var i = 0; i < cManager.picked_fields.length; i++) {
        if (cManager.picked_fields[i] == eventInfo.id) {
          cManager.picked_fields.splice(i, 1);
          isAlreadyFound = true;
        }
      }
      if (!isAlreadyFound) {
        cManager.picked_fields.push(eventInfo.id);
      }
      highLightSelectedFields(eventInfo.id);
      validateConfiguration();
    }
  }
};

//Used for managing pagination
var screenHandler = {
  //Uses ID of div containers
  screen_path: ["config_screen"],
  current_screen: "config_screen",
  next_screen: null,
  previous_screen: null,
  Set: {
    NextScreen: function(){
      switch (screenHandler.current_screen) {
        case "config_screen":
          //If action is field update, display field selection screen
          if (cManager.action == "edit_fields") {
            screenHandler.next_screen = "choose_fields_screen";
          }
          //If user wants to delete records, skip fields screen and display records screen depending on method selected
          else {
            if (cManager.method = "manual_select") {
              screenHandler.next_screen = "manual_select";
            }
            else if (cManager.method = "insert_ids") {
              screenHandler.next_Screen = "insert_ids";
            }
            //Since user wants to delete all records, just skip to confirmation screen
            else {
              screenHandler.next_screen = "confirmation_screen";
            }
          }
          //Store current screen as previous if user wants to go back
          screenHandler.previous_screen = screenHandler.current_screen;
          screenHandler.screen_path.push(screenHandler.next_screen);
          break;
        case "choose_fields_screen":
          screenHandler.next_screen = "set_field_values_screen";
          screenHandler.previous_screen = screenHandler.current_screen;
          screenHandler.screen_path.push(screenHandler.next_screen);
          break;
      }
    }
  }
}

//Load ZATClient
var client = ZAFClient.init();

//Load context data
cManager.Get.Subdomain().then(function(result){
  cManager.subdomain = result;
  console.log("Loaded subdomain: " + cManager.subdomain);
});

//EVENT LISTENERS

document.getElementById("next_screen_button").addEventListener("click", loadNextScreen);
document.getElementById("previous_screen_button").addEventListener("click", loadPreviousScreen);

document.getElementById("fields_next_page").addEventListener("click", loadNextFieldTablePage);
document.getElementById("fields_previous_page").addEventListener("click", loadPreviousFieldTablePage);

//LOGICAL FUNCTIONS

//Configuration screen
function validateConfiguration(){
  switch (screenHandler.current_screen) {
    case "config_screen":
      if (cManager.record_type && cManager.action && cManager.method){
        disableNextScreenButton(false);
        screenHandler.Set.NextScreen();
      }
      break;
      case "choose_fields_screen":
      if (cManager.picked_fields.length){
        disableNextScreenButton(false);
      }
      else {
        disableNextScreenButton(true);
      }
      break;
    }
}

function screenDataManipulation(){
  console.log(screenHandler.current_screen);
  switch (screenHandler.current_screen) {
    case "choose_fields_screen":
      cManager.Get.Fields().then(function(data){
        var elements;
        (cManager.record_type == "user") ? elements = "user_fields" : elements = "organization_fields";
        for (var i = 0; i < data[elements].length; i++) {
          if (data[elements][i].active) cManager.fields.push(data[elements][i]);
        }
        renderFieldsTable();
    })
    break;

    case "set_field_values_screen":


  }
}

function setDataForFieldsTable(){
    if (cManager.fields.length < 20){
      fieldsTableHelper.max_batch_length = cManager.fields.length;
    }

}

function allowNextPreviousFieldsPage(){
      if (fieldsTableHelper.max_batch_length == 20) {
            setNextFieldTablePage(false);
        }
      else {
            setNextFieldTablePage(true);
        }

      if (fieldsTableHelper.current_batch > 1) {
        setPreviousFieldTablePage(false);
        }
      else {
        setPreviousFieldTablePage(true);
        }
}

function loadNextFieldTablePage(){
  fieldsTableHelper.start_index = fieldsTableHelper.max_batch_length;
  if ((cManager.fields.length - fieldsTableHelper.max_batch_length) > fieldsTableHelper.max_batch_length * (fieldsTableHelper.current_batch + 1)) {
    fieldsTableHelper.max_batch_length = 20;
  }
  else {
    fieldsTableHelper.max_batch_length = cManager.fields.length - fieldsTableHelper.current_batch * fieldsTableHelper.max_batch_length;
  }
  fieldsTableHelper.current_batch++;
  renderFieldsTable();
}

function loadPreviousFieldTablePage(){
  fieldsTableHelper.current_batch--;
  fieldsTableHelper.start_index = fieldsTableHelper.start_index - 20;
  fieldsTableHelper.max_batch_length = 20;
  renderFieldsTable();
}

//HTML MANIPULATION
function disableNextScreenButton(buttonState){
  document.getElementById("next_screen_button").disabled = buttonState;
}

function loadNextScreen(){
  document.getElementById(screenHandler.current_screen).style.visibility = "hidden";
  document.getElementById(screenHandler.next_screen).style.visibility = "visible";
  screenHandler.current_screen = screenHandler.screen_path[screenHandler.screen_path.length - 1];
  disableNextScreenButton(true);
  setScreenTitle(screenHandler.current_screen);
  screenDataManipulation();
}

function loadPreviousScreen(){

}

function renderFieldsTable(){
  console.dir(fieldsTableHelper);
  console.dir(cManager.fields);
  document.getElementById("choose_fields_table").innerHTML = "";
  var current_record = fieldsTableHelper.start_index;
  for (current_record; current_record < fieldsTableHelper.max_batch_length + fieldsTableHelper.start_index; current_record++) {
    let table = document.getElementById("choose_fields_table");
    let newRow = table.insertRow(0);
    let newCell = document.createElement('td');
    newRow.append(newCell);
    newCell.innerHTML = cManager.fields[current_record].title;
    newCell.id = cManager.fields[current_record].key;
    newCell.className = "fieldTableCells";
    newCell.setAttribute ("onclick", "cManager.Add.Fields(this)");
    highLightSelectedFields(newCell.id);
  };
  allowNextPreviousFieldsPage();
}

function setNextFieldTablePage(btnState){
  document.getElementById("fields_next_page").disabled = btnState;
}

function setPreviousFieldTablePage(btnState){
  document.getElementById("fields_previous_page").disabled = btnState;
}

function highLightSelectedFields(field_key){
  var isAlreadyFound = false;
  console.log("Field key: " + field_key);
  console.dir(cManager.picked_fields);
  for (var i = 0; i < cManager.picked_fields.length; i++) {
    if (cManager.picked_fields[i] == field_key) {
      document.getElementById(field_key).style.backgroundColor = "#41c8dc";
      console.log("Hey I got it!");
      isAlreadyFound = true;
      break;
    }
  }
  if (!isAlreadyFound) document.getElementById(field_key).style.backgroundColor = "white";
}

var fieldsTableHelper = {
  start_index: 0,
  current_batch: 1,
  max_batch_length: 20,
}
function setScreenTitle(new_title){
  let current_title = document.getElementById("screen_info");
  switch (screenHandler.next_screen) {
    case "config_screen":
    current_title.innerHTML = "Configuration";
    break;
    case "choose_fields_screen":
    current_title.innerHTML = "Choose fields";
    break;
    case "set_field_values_screen":
    current_title.innerHTML = "Set field values";
    break;
    case "manual_select_screen":
    current_title.innerHTML = "Select records";
    break;
    case "insert_ids_screen":
    current_title.innerHTML = "Insert record IDs";
    break;
    case "confirmation_screen":
    current_title.innerHTML = "Confirm actions";
    break;
  }
};
