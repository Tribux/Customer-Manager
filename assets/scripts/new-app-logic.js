//Load ZATClient
var client = ZAFClient.init();

//Load context data
cManager.Get.Subdomain().then(function(result){
  cManager.subdomain = result;
  console.log("Loaded subdomain: " + cManager.subdomain);
});

//Event Listeners

document.getElementById("next_screen_button").addEventListener("click", renderNextScreen);
document.getElementById("previous_screen_button").addEventListener("click", renderPreviousScreen);

document.getElementById("fields_next_page").addEventListener("click", renderFieldsTable);
//Logical functions


function recordTableNextPage(){

};

function recordTablePreviousPage(){


};

function getFields(){
  cManager.Get.Fields().then(function(data){
    var elements;
    (cManager.record_type == "user") ? elements = "user_fields" : elements = "organization_fields";
    for (var i = 0; i < data[elements].length; i++) {
      if (data[elements][i].active) cManager.fields.push(data[elements][i]);
    }
    renderFieldsTable();
  });
};

function fieldsTableNextPage(){
  console.log("hey");

};

function fieldsTableNextPage(){

};

//Manipulate HTML functions

function renderNextScreen(){
  document.getElementById(screenHandler.current_page).style.visibility = "hidden";
  document.getElementById(screenHandler.next_page).style.visibility = "visible";
  screenHandler.Set.NextAndPreviousPages();
  setScreenTitle();
  getFields();
};

function renderPreviousScreen(){

};

function renderRecordTable(){

};

function renderFieldsTable(){

  document.getElementById("choose_fields_table").innerHTML = "";

  var current_record;
  for (current_record = tablePagination.start_index; current_record < tablePagination.limit_fields; current_record++) {
    let table = document.getElementById("choose_fields_table");
    let newRow = table.insertRow(0);
    let newCell = document.createElement('td');
    newRow.append(newCell);
    newCell.innerHTML = cManager.fields[current_record].title;
    newCell.className = "fieldTableCells";
  };

};

function setNextButtonState(state){
  document.getElementById("next_screen_button").disabled = state;
};

function setPreviousButtonState(){
  document.getElementById("previous_screen_button").disabled = state;
};

function setScreenTitle(){
  let current_title = document.getElementById("screen_info");
  switch (screenHandler.current_page) {
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

//Screen handler

var screenHandler = {
  current_page: "config_screen",
  next_page: null,
  previous_page: null,

  IsAllowed: {
    NextPage: function(){
      switch (screenHandler.current_page) {
        case "config_screen":
        if (cManager.record_type && cManager.method && cManager.action) {
          setNextButtonState(false);
        }
        if (cManager.action == "edit_fields") {
          screenHandler.next_page = "choose_fields_screen";
        }
        else {
          if (cManager.method == "manual_select") {
            screenHandler.next_page = "manual_select_screen";
          }
          else if (cManager.method == "insert_ids") {
            screenHandler.next_page = "insert_ids_screen";
          }
          else {
            screenHandler.next_page = "confirmation_screen";
          }
        }
        break;
      }
      console.log(screenHandler.next_page);
    }
  },
  Set: {
    NextAndPreviousPages: function(){
      screenHandler.previous_page = screenHandler.current_page;
      screenHandler.current_page = screenHandler.next_page;
    }
  }
};

var tablePagination = {
current_batch: null,
limit_fields: null,
start_index: null
}
