/**
  * ------------------ *
  *  DATA SEND
  * ------------------ *
*/

/**
  * Handle send data
*/
function handleSendData(data, email, callback) {
  
  var results = splitResultBySendType(data.result, data.entities);
  
  //Logger.log(results.sendLater);
  
  // main result
  var mainResultsToSend = filterResults(results.main, results.sendLater);	
  if (mainResultsToSend.length) {
    handleMailSend(data, mainResultsToSend, email, callback);
  }
  
  // custom result
  var customResultsToSend = filterResults(results.custom, results.sendLater);
  if (customResultsToSend.length) {
    for (var j = 0; j < customResultsToSend.length; j++ ) {
      
      var id = customResultsToSend[j];
      var singleResult = [id];
      var customEmail = data.entities.advanced[id].params.email;  
      
      mailSendSeparateResults(data, singleResult, customEmail, callback);
    }
  }
  
  // sms result
  var smsResultsToSend = filterResults(results.sms, results.sendLater);
  if (smsResultsToSend.length) {
    for (var k = 0; k < smsResultsToSend.length; k++ ) {
      
      var id = smsResultsToSend[k];
      var singleResult = [id];
      
      var freeUser = data.entities.advanced[id].params.freeUser || params.freeUser;
      var freePass = data.entities.advanced[id].params.freePass || params.freePass;
      
      if (freeUser && freePass) {
        sendSmsWithFreeGateway(data, singleResult, freeUser, freePass);
      }
      
    }
  }
  
}


/**
  * Split result by send type
*/
function splitResultBySendType(selectedResult, entities) {
	
  var results = {
    main: [],
    custom: [],
    sms: [],
    sendLater: []
  }
  
  for (var i = 0; i < selectedResult.length; i++ ) {
    
    var id = selectedResult[i];
    var singleParams = entities.advanced[id].params;

    if ( singleParams.hourFrequency ) {
      
      var lastAdSent = entities.advanced[id].lastAdSentDate;
      var now = new Date();
      var hourDiff = getHourDiff(lastAdSent, now);

      if (hourDiff < singleParams.hourFrequency) {
        results.sendLater.push( id );
      }      
    }
    
    if (singleParams.email && (singleParams.email !== email) ) {
      results.custom.push( id );
    } else {
      results.main.push( id );
    }
    
    if (singleParams.sendSms == true)  {
      results.sms.push( id );
    }
  }

  return results;
}


/**
  * Send data to
  * TO REFACTOR ?
*/
function handleMailSend( data, selectedResult, email, callback ) {
  
  if (params.groupedResults) {
    Logger.log(selectedResult);
    mailSendGroupedResults(data, selectedResult, email, function(error, callbackResult) {
      // If grouped mail is too big, try to send in separate results
      if (error) {
        
        mailSendSeparateResults(data, selectedResult, email, callback);
      } else {
        
        if (callback && typeof(callback) === "function") {
          return callback(error, callbackResult);
        } 
      }
    });
    
  } else {
    
    Logger.log("ouais");
    mailSendSeparateResults(data, selectedResult, email, callback);
  }
}


/**
  * Mail send grouped results
*/
function mailSendGroupedResults( data, selectedResult, email, callback ) {
    
  var mail = getGroupedMail( data, selectedResult );
  
  sendEmail(email, mail, callback, selectedResult);
}


/**
  * Mail send separate results
*/
function mailSendSeparateResults( data, selectedResult, email, callback ) {  
  
  var mails = getSeparateMails(data, selectedResult);
  
  for (var i = 0; i < selectedResult.length; i++ ) {
    var mail = mails[i];
    var id = data.result[i];
    var singleResult = [id];
    
    sendEmail(email, mail, callback, singleResult);    
  }
}


/**
  * Get grouped mail
*/
function getGroupedMail( data, selectedResult ) {
 
  var mail = {
    title: getMailTitle( selectedResult, data.entities ),
    html: getMailTemplate( selectedResult, data.entities, data.update, data.sheetUrl ),
    text: getTextMailTemplate( selectedResult, data.entities, data.update, data.sheetUrl )
  }
  
  return mail;
}


/**
  * Get separate mails
*/
function getSeparateMails( data, selectedResult ) {  
  
  var mails = [];
  
  for (var i = 0; i < selectedResult.length; i++ ) {
    
    var id = data.result[i];
    var singleResult = [id];
    
    var mail = {
      title: getMailTitle( singleResult, data.entities ),
      html: getMailTemplate( singleResult, data.entities, data.update, data.sheetUrl ),
      text: getTextMailTemplate( singleResult, data.entities, data.update, data.sheetUrl )
    };
    
    mails.push(mail);
  }
  
  return mails;
}


/**
  * Send email
*/
function sendEmail(email, mail, callback, callbackResult) {
  
  var titlePrefix = params.debug == true ? "[debug] " : "";
  var error;
  
  try {

    MailApp.sendEmail(
      email,
      titlePrefix + mail.title,
      mail.text,
      { 
        htmlBody: params.plainText == true ? undefined : mail.html
      }
    );
    
  } catch(exception) {
    
    log( exception )
    error = exception;
  }
  
  if (callback && typeof(callback) === "function") {
    Logger.log("ok le callback");
    return callback(error, callbackResult);
  }
  //{"message":"Limite dépassée : Taille du corps de l'e-mail.","name":"Exception","fileName":"Code","lineNumber":566,"stack":"\tat Code:566 (sendEmail)\n\tat Code:557 (sendGroupedData)\n\tat Code:530 (sendDataTo)\n\tat Code:256 (start)\n"}
}




/**
  * Free send sms
*/
function freeSendSms(user, pass, message) {
  
  //message = message.replace(/(\r\n|\n|\r)/gm,""); //les sauts de lignes ne passent pas en GET, alors on nettoie
  message = encodeURIComponent( message.substring(0, 480) ).replace(/'/g,"%27").replace(/"/g,"%22");
  
  //Logger.log(message);
  
  var url = "https://smsapi.free-mobile.fr/sendmsg?user=" + user + "&pass=" + pass + "&msg=" + message;
  
  try {
    UrlFetchApp.fetch(url);
    
  } catch(e) {
    Logger.log(e);
  }
}


/**
  * Send sms with free 
*/
function sendSmsWithFreeGateway(data, selectedResult, user, pass) {
	
	var messages = getSmsMessages(data, selectedResult);
	
	for (var i = 0; i < messages.length; i++ ) {    
      var message = messages[i];
	  freeSendSms(user, pass, message);
	}
	
}


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