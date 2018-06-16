/**
  * ------------------ *
  *  DATA SEND
  * ------------------ *
*/


/**
  * Split result by send type
*/
function splitResultBySendType(selectedResult, entities) {
	
  var results = {
    main: [],
    custom: [],
    group: {},
    sms: [],
    sendLater: []
  }
  
  selectedResult.map( function( id ) {
    
    var singleParams = entities.advanced[id].params;

    if ( singleParams.hourFrequency ) {
      
      var lastAdSent = entities.advanced[id].lastAdSentDate;
      var now = new Date();
      var hourDiff = getHourDiff(lastAdSent, now);

      if (hourDiff < singleParams.hourFrequency) {
        results.sendLater.push( id );
      }      
    }
    
    var splitGroupFromMainSend = entities.labels[id].isGroup == true && getParam('splitSendByCategory') == true ? true : false;
    if (splitGroupFromMainSend || singleParams.separateSend == true || (singleParams.email && (singleParams.email !== getParam('email')))  ) {
      if (entities.labels[id].isGroup == true) {
        var name = entities.labels[id].groupName;        
        (results.group[ name ] = results.group[ name ] ? results.group[ name ] : []).push( id ); // yep!
      } else {
        results.custom.push( id );
      }
    } else {
      results.main.push( id );
    }
    
    if (singleParams.sendSms == true)  {
      results.sms.push( id );
    }
    
  });
  
  return results;
}


/**
  * Handle send data
*/
function handleSendData(data, callback) {
    
  var results = splitResultBySendType(data.result, data.entities);
    
  // main result
  var readyMainResults = filterResults(results.main, results.sendLater);
  var mainAds = getAllAdsFromResult( data, readyMainResults );
  var mainAdsData = getEnhancedData( data );
  sendMainResults( mainAdsData, readyMainResults, callback );
  
  /*if ( getParam('splitSendByCategory') == true ) {
    var mainAdsData = getEnhancedData( data );
    //var mainAdsData = data;
    mainAdsData = getCategorySortedData( mainAdsData, mainAds ); // reconstructed data
    sendResultsByCategory( mainAdsData, mainAdsData.result, callback );  
  } else {
    var mainAdsData = getEnhancedData( data );
    //var mainAdsData = data;
    sendMainResults( mainAdsData, readyMainResults, callback );
  }*/
  
   
  var readySeparateGroupResults = {};
  Object.keys(results.group).map(function(key, index) {
    readySeparateGroupResults[key] = filterResults(results.group[key], results.sendLater)
  });
  sendSeparateGroupResults( data, readySeparateGroupResults, callback );
  
  // custom result
  var readyCustomResults = filterResults(results.custom, results.sendLater);
  sendCustomResults( data, readyCustomResults, callback );
  
  // sms result
  var readySmsResults = filterResults(results.sms, results.sendLater);
  sendSmsResults( data, readySmsResults, callback );
  
}


/**
  * Send main results
*/
function sendMainResults(data, mainResults, callback) {
  if (mainResults.length) {
    handleMailSend(data, mainResults, getParam('email'), callback);
  }
}




/**
  * Send separate group results
*/
function sendSeparateGroupResults(data, groupResults, callback) {
  Object.keys(groupResults).map( function( key ) {  
    var groupResult = groupResults[key];
    if (groupResult.length) {      
      mailSendGroupedResults(data, groupResult, getParam('email'), callback);
    }
  })
}


/**
  * Send results by category
*/
function sendResultsByCategory(data, categoryResults, callback) {
  if (categoryResults.length) {

    categoryResults.map( function( id ) {  
      var singleResult = [id];

      if (data.entities.ads[id].toSend.length) {
        mailSendSeparateResults(data, singleResult, getParam('email'), callback);
      }
    })
    
  }
}


/**
  * Send custom results
*/
function sendCustomResults(data, customResults, callback) {
  if (customResults.length) {

    customResults.map( function( id ) {
      var singleResult = [id];
      var customEmail = data.entities.advanced[id].params.email || getParam('email');  
      
      data.entities.advanced[id].haveDuplicates = false; // because they are separated mails & searches
      
      mailSendSeparateResults(data, singleResult, customEmail, callback);
    })
    
  }
}


/**
  * Send sms results
*/
function sendSmsResults(data, smsResults, callback) {
  if (smsResults.length) {

    smsResults.map( function( id ) {
      var singleResult = [id];
      
      var freeUser = data.entities.advanced[id].params.freeUser || getParam('freeUser');
      var freePass = data.entities.advanced[id].params.freePass || getParam('freePass');
      
      if (freeUser && freePass) {
        sendSmsWithFreeGateway(data, singleResult, freeUser, freePass, callback);
      }
    })
    
  }
}



