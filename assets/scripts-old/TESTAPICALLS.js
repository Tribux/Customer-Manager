var appData={
  subdomain: null,
};

var client = ZAFClient.init();


client.context().then(function (context) {
  appData.context = context;
})

//GET

document.getElementById("getorgfields").addEventListener("click", function(){
  var requestParameters = {
    url: 'https://arca.zendesk.com/api/v2/organization_fields.json',
    type: 'GET',
    dataType: 'text',
  };

  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      console.dir(requestResults);
    });
});

document.getElementById("getuserfields").addEventListener("click", function(){
  var requestParameters = {
    url: 'https://arca.zendesk.com/api/v2/user_fields.json',
    type: 'GET',
    dataType: 'text',
  };

  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      console.dir(requestResults);
    });
});

document.getElementById("getusers").addEventListener("click", function(){
  var requestParameters = {
    url: 'https://arca.zendesk.com/api/v2/users.json',
    type: 'GET',
    dataType: 'text',
  };

  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      console.dir(requestResults);
    });
});

document.getElementById("getorgs").addEventListener("click", function(){
  var requestParameters = {
    url: 'https://arca.zendesk.com/api/v2/organizations.json',
    type: 'GET',
    dataType: 'text',
  };

  client.request(requestParameters).then(
    function (data) {
      //Parse data
      var requestResults = JSON.parse(data);
      console.dir(requestResults);
    });
});


//UPDATE
