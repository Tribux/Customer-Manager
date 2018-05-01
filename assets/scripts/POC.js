'use strict'

//Objects

//Procedures for API calls
var apiCall = {
  Get: {
    Subdomain: function(){
      return (client.context().then(function(context){
        return context.account.subdomain;
      })
    )
  },
  Records: function(next_page_url){
    var requestParameters;
    if (next_page_url == null) {
      requestParameters = {
        url: 'https://'+ settings.subdomain +'.zendesk.com/api/v2/' + settings.record_type +'s.json?per_page=20',
        type: 'GET',
        dataType: 'text'
      };
    }
    else {
      requestParameters = {
        url: next_page_url,
        type: 'GET',
        dataType: 'text'
      };
    }

    return (client.request(requestParameters).then(function (data) {
      var requestResults = JSON.parse(data);
      return requestResults;
    }));
  },

  Fields: function(next_page_url){
    var requestParameters = {
      url: 'https://' + settings.subdomain + '.zendesk.com/api/v2/' + settings.record_type +'_fields.json',
      type: 'GET',
      dataType: 'text'
    };
    return (client.request(requestParameters).then(function (data) {
      var requestResults = JSON.parse(data);
      return requestResults;
    }));
  }
}
};

//Settings for customer manager mode (orgs, users, all records etc...) and procedures for managing its data
var settings = {
  subdomain: null,
  record_type: null,
  method_selection_type: null,
  action_type: null,
  Set: {
    ActionType: function(eventData){
      settings.action_type = eventData.value;
      console.log(settings.action_type);
      ValidateCurrentPageData();
    },
    MethodType: function(eventData){
      settings.method_selection_type = eventData.value;
      console.log(settings.method_selection_type);
      ValidateCurrentPageData();
    },
    RecordType: function(eventData){
      settings.record_type = eventData.value;
      console.log(settings.record_type);
      ValidateCurrentPageData();
    }
  }
};

//Stores selected records and some procedures required for data management
var records = {
  selected: [],
  next_page: null,
  previous_page: null,
  NewRecord: function(eventData){
    console.dir(eventData);
    var isAlreadyFound = false;
    for (var i = 0; i < records.selected.length; i++) {
      if (records.selected[i] == eventData.id) {
        records.selected.splice(i, 1);
        ValidateCurrentPageData();
        isAlreadyFound = true;
        RemoveSelectedRecord('selected'+eventData.id);
        HighlightElement(false, eventData.id);
      }
    }
    if (!isAlreadyFound) {
      records.selected.push(eventData.id);
      ValidateCurrentPageData();
      ShowSelectedRecords(eventData.innerHTML, 'selected'+eventData.id);
      HighlightElement(true, eventData.id);
    }
    console.dir(records.selected);
  }
};

//Stores information about user/organization fields
var fields = {
  selected: [],
  active_fields_titles: [],
  active_fields_keys: [],
  active_fields_types: [],
  table_start_index: 0,
  NewField: function(eventData){
    console.dir(eventData);
    var isAlreadyFound = false;
    for (var i = 0; i < fields.selected.length; i++) {
      if (fields.selected[i] == eventData.id) {
        fields.selected.splice(i, 1);
        ValidateCurrentPageData();
        isAlreadyFound = true;
        RemoveSelectedRecord('selected'+eventData.id);
        HighlightElement(false, eventData.id);
      }
    }
    if (!isAlreadyFound) {
      fields.selected.push(eventData.id);
      ValidateCurrentPageData();
      ShowSelectedRecords(eventData.innerHTML, 'selected'+eventData.id);
      HighlightElement(true, eventData.id);
    }
    console.dir(fields.selected);
  }
};

//Stores information for pagination and procedure to set correct path
var screenHandler = {
  screen_path: [],
  current_page: 'config_screen',
  current_page_id: 0,
  Set: {
    PagePath: function(){
      //Clean any data that may be found in array
      screenHandler.screen_path = [];
      //Always append configuration screen to path
      screenHandler.screen_path.push('config_screen');
      //Append record selection screen, if not all records are picked
      if (settings.method_selection_type == 'manual_select') {
        screenHandler.screen_path.push('manual_select_screen');
      }
      //If chosen, append screen for inserting record IDs
      else if (settings.method_selection_type == 'insert_ids') {
        screenHandler.screen_path.push('insert_ids_screen');
      }
      //If action is not 'delete', display fields for editing and screen for inserting values
      if (settings.action_type == 'edit_fields'){
        screenHandler.screen_path.push('choose_fields_screen');
        screenHandler.screen_path.push('set_field_values_screen');
      }
      //Always end with confirmation screen
      screenHandler.screen_path.push('confirmation_screen');
    }
  }
};

//Set ZAFClient
var client = ZAFClient.init();

//Load context data
apiCall.Get.Subdomain().then(function(result){
  settings.subdomain = result;
  console.log('Loaded subdomain: ' + settings.subdomain);
});

//Event listeners

//Constant buttons for navigating pages
document.getElementById('next_screen_button').addEventListener('click', ContinueToNextScreen);
document.getElementById('previous_screen_button').addEventListener('click', BackToPreviousScreen);

//Buttons for pagination on records table
document.getElementById('records_next_page').addEventListener('click', GetRecordsNext);
document.getElementById('records_previous_page').addEventListener('click', GetRecordsPrevious);

//Buttons for pagination on fields table
document.getElementById('fields_next_page').addEventListener('click', GetFieldsNext);
document.getElementById('fields_previous_page').addEventListener('click', GetFieldsPrevious);

//Logic functions

//Load next page
function ContinueToNextScreen(){

  //If user is done configuring settings, create path
  if (screenHandler.current_page == 'config_screen') {
    screenHandler.Set.PagePath();
    console.dir(screenHandler.screen_path);
  }

  //Increase current page id and set new current page
  screenHandler.current_page_id++;
  screenHandler.current_page = screenHandler.screen_path[screenHandler.current_page_id];

  //Validate if next/previous page button should be allowed
  ValidateCurrentPageData();

  //Render new page
  ShowHidePagesNext();

  //Get new page title
  GetNewPageTitle();


  //Allow user to go back
  DisallowBackButton(false);

  //Load relevant functions for new page
  switch (screenHandler.screen_path[screenHandler.current_page_id]) {
    case 'choose_fields_screen':
    CleanTable('choose_fields_table');
    GetFields(null);
    break;

    case 'set_field_values_screen':
    GetSelectedFields();
    break;

    case 'manual_select_screen':
    GetRecords(null);
    break;

    case 'insert_ids_screen':
    break;

    case 'confirmation_screen':
    break;
  }
};

//Load previous page
function BackToPreviousScreen(){
  //Increase current page id
  screenHandler.current_page_id--;
  screenHandler.current_page = screenHandler.screen_path[screenHandler.current_page_id];
  //Render new page
  ShowHidePagesPrevious();

  //Get new page title
  GetNewPageTitle();

  //Validate if next/previous page button should be allowed
  ValidateCurrentPageData();

  //Load relevant functions for new page
  switch (screenHandler.screen_path[screenHandler.current_page_id]) {
    case 'choose_fields_screen':
    CleanTable('choose_fields_table');
    GetFields(null);
    break;

    case 'set_field_values_screen':
    break;

    case 'manual_select_screen':
    GetRecords(null);
    break;

    case 'insert_ids_screen':
    break;

    case 'confirmation_screen':
    break;
  }
};

//Validate data for current page, enable/disable continue/back buttons depending on this function
function ValidateCurrentPageData(){
  console.log("Validating: " + screenHandler.current_page);
  switch (screenHandler.current_page) {
    case 'config_screen':
    DisallowBackButton(true);
    (settings.record_type && settings.method_selection_type && settings.action_type) ? DisallowContinueButton(false) : DisallowContinueButton(true);
    break;

    case 'choose_fields_screen':
    (fields.selected.length > 0) ? DisallowContinueButton(false) : DisallowContinueButton(true);
    break;

    case 'set_field_values_screen':
    break;

    case 'manual_select_screen':
    (records.selected.length > 0) ? DisallowContinueButton(false) : DisallowContinueButton(true);
    break;

    case 'insert_ids_screen':
    break;

    case 'confirmation_screen':
    break;
  }

};

//Get constat page title
function GetNewPageTitle(){
  switch (screenHandler.screen_path[screenHandler.current_page_id]) {
    case 'config_screen':
    SetPageTitle('Configuration');
    break;

    case 'choose_fields_screen':
    SetPageTitle('Available fields');
    break;

    case 'set_field_values_screen':
    SetPageTitle('New field values');
    break;

    case 'manual_select_screen':
    SetPageTitle('Available records');
    break;

    case 'insert_ids_screen':
    SetPageTitle('Records by ID');
    break;

    case 'confirmation_screen':
    SetPageTitle('Confirm actions');
    break;
  }
};

//Get records
function GetRecords(records_url){
  apiCall.Get.Records(records_url).then(function(data){

    CleanTable('available_records_table');

    console.dir(data);

    //Set record selector
    var record_selector;
    (settings.record_type == 'organization') ? record_selector = 'organizations' : record_selector = 'users';

    //Loop through records and call function to render on interface
    var i;
    for (i = 0; i < data[record_selector].length; i++) {
      ShowAvailableRecords(data[record_selector][i].name, data[record_selector][i].id);
      //Highlight selected records
      for (var x = 0; x < records.selected.length; x++) {
        console.log("Highglight: " + records.selected[x]);
        if (data[record_selector][i].id == records.selected[x]) HighlightElement(true, records.selected[x]);
      }
    }

    //Store URLs for record table pagination
    records.next_page = data.next_page;
    records.previous_page = data.previous_page;

    console.dir(records);

    //Set pagination
    (data.next_page != null) ? DisallowRecordsPageNext(false) : DisallowRecordsPageNext(true);
    (data.previous_page != null) ? DisallowRecordsPagePrevious(false) : DisallowRecordsPagePrevious(true);

  });
};

//Get next records pages
function GetRecordsNext(){
  CleanTable('available_records_table');
  GetRecords(records.next_page);
};

//Get previous records page
function GetRecordsPrevious(){
  CleanTable('available_records_table');
  GetRecords(records.previous_page);
};

//Get fields
function GetFields(){
  apiCall.Get.Fields().then(function(data){

    console.dir(data);

    var record_selector;
    (settings.record_type == 'user') ? record_selector = 'user_fields' : record_selector = 'organization_fields';


    //Loop through records and store active fields
    for (var i = 0; i < data[record_selector].length; i++) {
      if (data[record_selector][i].active) {
        fields.active_fields_keys.push(data[record_selector][i].key);
        fields.active_fields_titles.push(data[record_selector][i].title);
        fields.active_fields_types.push(data[record_selector][i].type);
      }
    }

    console.log("Fields object: ");
    console.dir(fields);

    //If there is more than 20 fields, enable pagination and limit display
    if (fields.active_fields_titles.length > 20) {
      for (var i = 0; i < 20; i++) {
        ShowActiveFields(fields.active_fields_titles[i], fields.active_fields_keys[i]);
      }
      DisallowFieldsPageNext(false);
    }
    else {
      for (var i = 0; i < fields.active_fields_titles.length; i++) {
        ShowActiveFields(fields.active_fields_titles[i], fields.active_fields_keys[i]);
      }
    }

    //Highlight selected fields
    for (var x = 0; x < fields.selected.length; x++) {
      console.log("Highglight: " + fields.selected[x]);
      if (data[record_selector][i].id == fields.selected[x]) HighlightElement(true, fields.selected[x]);
    }

  })
};

//set Data for loading next page on fields table
function GetFieldsNext(){
  CleanTable('choose_fields_table');
  fields.table_start_index = fields.table_start_index+20;
  console.dir(fields);

  for (var i = fields.table_start_index; i < fields.table_start_index+20; i++) {
    if (fields.active_fields_titles[i]) {
      ShowActiveFields(fields.active_fields_titles[i], fields.active_fields_keys[i]);
      HighlightSelectedFields(fields.active_fields_keys[i]);
    }
    if (fields.active_fields_titles.length-1 == i) DisallowFieldsPageNext(true);
  }
  DisallowFieldsPagePrevious(false);

  HighlightSelectedFields();
};

//set Data for loading previous page on fields table
function GetFieldsPrevious(){
  CleanTable('choose_fields_table');
  fields.table_start_index = fields.table_start_index - 20;

  console.dir(fields);
  for (var i = fields.table_start_index; i < fields.table_start_index + 20; i++) {
    if (fields.active_fields_titles[i]) {
      ShowActiveFields(fields.active_fields_titles[i], fields.active_fields_keys[i]);
      HighlightSelectedFields(fields.active_fields_keys[i]);
    }
    if (fields.table_start_index == 0){
      DisallowFieldsPagePrevious(true);
    }
      DisallowFieldsPageNext(false);
  }
};

//Check selected fields for highlighting
function HighlightSelectedFields(field_key){
  for (var i = 0; i < fields.selected.length; i++) {
    if (fields.selected[i] == field_key){
      HighlightElement(true, field_key);
    }
  }
};

//Get selected fields for rednering on field values screen
function GetSelectedFields(){
  for (var i = 0; i < fields.selected.length; i++) {

    ShowSelectedFieldInputForm(fields.selected., type, id);
  }
};

//HTML manipulation functions

//Set next page button state
function DisallowContinueButton(button_state){
  document.getElementById('next_screen_button').disabled = button_state;
};

//Set previous page button state
function DisallowBackButton(button_state){
  document.getElementById('previous_screen_button').disabled = button_state;
};

//Hide old page and render new one when going forward
function ShowHidePagesNext(previous_page, current_page){
  document.getElementById(screenHandler.screen_path[screenHandler.current_page_id]).style.visibility = 'visible';
  document.getElementById(screenHandler.screen_path[screenHandler.current_page_id-1]).style.visibility = 'hidden';
};

//Hide old page and render new one when going backwards
function ShowHidePagesPrevious(previous_page, current_page){
  document.getElementById(screenHandler.screen_path[screenHandler.current_page_id]).style.visibility = 'visible';
  document.getElementById(screenHandler.screen_path[screenHandler.current_page_id+1]).style.visibility = 'hidden';
};

//Set persistent title on upper left corner
function SetPageTitle(new_title){
  document.getElementById('screen_info').innerHTML = new_title;

}

//Clear any existing records
function CleanTable(table_id){
  document.getElementById(table_id).innerHTML = '';
};

//Render available records
function ShowAvailableRecords(record_name, record_id){
  console.log('Adding record: ' + record_name);
  let table = document.getElementById('available_records_table');
  let newRow = table.insertRow(0);
  let newCell = document.createElement('td');
  newRow.append(newCell);
  newCell.innerHTML = record_name;
  newCell.id = record_id;
  newCell.className = 'availableRecordCells';
  newCell.setAttribute ('onclick', 'records.NewRecord(this)');
};

//Render active fields
function ShowActiveFields(record_name, record_id){
  console.log('Adding record: ' + record_name);
  let table = document.getElementById('choose_fields_table');
  let newRow = table.insertRow(0);
  let newCell = document.createElement('td');
  newRow.append(newCell);
  newCell.innerHTML = record_name;
  newCell.id = record_id;
  newCell.className = 'availableFieldsCells';
  newCell.setAttribute ('onclick', 'fields.NewField(this)');
};

//Highlight selected element
function HighlightElement(highlight, element_id){
  console.log("Element for highlithing: " + element_id);
  (highlight) ? document.getElementById(element_id).style.backgroundColor = '#41c8dc' : document.getElementById(element_id).style.backgroundColor = 'white';
};

//Display selected records on right side of the selection page
function ShowSelectedRecords(record_name, record_id){
  let table = document.getElementById('selected_records_table');
  let newRow = table.insertRow(0);
  let newCell = document.createElement('td');
  newRow.append(newCell);
  newRow.id = record_id;
  newCell.innerHTML = record_name;
  newCell.className = 'selectedRecords';
};

//Remove selected records from the right side of the page
function RemoveSelectedRecord(row_id){
  let row = document.getElementById(row_id);
  row.deleteCell(0);
  row.parentNode.removeChild(row);
};

//Allows/Disallows next page button on records
function DisallowRecordsPageNext(button_state){
  document.getElementById('records_next_page').disabled = button_state;
};

//Allows/Disallows previous page button on records
function DisallowRecordsPagePrevious(button_state){
  document.getElementById('records_previous_page').disabled = button_state;
};

//Allows/Disallows next button on fields
function DisallowFieldsPageNext(button_state){
  document.getElementById('fields_next_page').disabled = button_state;
};

//Allows/Disallows previous button on fields
function DisallowFieldsPagePrevious(button_state){
  document.getElementById('fields_previous_page').disabled = button_state;
};

//Show input forms for selected fields
function ShowSelectedFieldInputForm(field_title, field_type, field_id){
  
};
