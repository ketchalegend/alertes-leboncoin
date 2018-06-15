/** ------
  *  FREE
  * ------
*/


/**
  * Free send sms
*/
function freeSendSms(user, pass, message, callback, dataForCallback, resultForCallback) {
  
  //message = message.replace(/(\r\n|\n|\r)/gm,""); //les sauts de lignes ne passent pas en GET, alors on nettoie
  message = encodeURIComponent( message.substring(0, 480) ).replace(/'/g,"%27").replace(/"/g,"%22");
  var error;
  
  //Logger.log(message);
  
  var url = "https://smsapi.free-mobile.fr/sendmsg?user=" + user + "&pass=" + pass + "&msg=" + message;
  
  try {
    UrlFetchApp.fetch(url);
    
  } catch(exception) {
    Logger.log(exception);
    error = exception;
  }
  
  if (callback && typeof(callback) === "function") {
    //Logger.log("ok le callback");
    return callback(error, user, dataForCallback, resultForCallback);
  }
}


/**
  * Send sms with free 
*/
function sendSmsWithFreeGateway(data, selectedResult, user, pass, callback) {
	
  var messages = getSmsMessages(data, selectedResult);
	
  messages.map( function( message ) {
    
    freeSendSms(user, pass, message, callback, data, selectedResult);
  })

}




/** ------------------------
  *  BOUYGUES (draft !)
  * ------------------------
*/


function bouyguesSendSms(number, message) {
  
  message = encodeURIComponent( message.substring(0, 160) ).replace(/'/g,"%27").replace(/"/g,"%22");
  
  var postData = {
    'fieldMsisdn': number,
    'fieldMessage': message,
    'Verif.x': '51',
    'Verif.y': '16'
  };
  
  var options = {
   'method' : 'post',
   'payload' : postData
 };
  
  // ATTENTION : limite de bouygues à 5 sms / jour 
  // inspiré de https://github.com/y3nd/bouygues-sms/blob/master/index.js, mais nécessite une athentification
  
  try {
    UrlFetchApp.fetch('https://www.secure.bbox.bouyguestelecom.fr/services/SMSIHD/confirmSendSMS.phtml', options);
    
  } catch(e) {
    Logger.log(e);
  }
  
}

/**
  * Send sms with bouygues 
*/
function sendSmsWithBouyguesGateway(data, selectedResult, user, pass) {
	
	var messages = getSmsMessages(data, selectedResult, 1);
  
	for (var i = 0; i < messages.length; i++ ) {    
      var message = messages[i];
      bouyguesSendSms(user, pass, message);
	}
	
}