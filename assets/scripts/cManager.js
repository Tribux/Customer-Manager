
var cManager = {
  subdomain : null,
  record_type: null,
  action: null,
  method: null,
  records: [],
  fields: [],
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
      screenHandler.IsAllowed.NextPage();
    },
    ActionType: function(eventInfo){
      cManager.action = eventInfo.value;
      console.log("Action type: " + cManager.action);
      screenHandler.IsAllowed.NextPage();
    },
    MethodType: function(eventInfo){
      cManager.method = eventInfo.value;
      console.log("Method type: " + cManager.method);
      screenHandler.IsAllowed.NextPage();
    }
  }
};
