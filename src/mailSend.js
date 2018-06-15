/**
  * Send email
*/
function sendEmail(email, mail, callback, dataForCallback, resultForCallback) {
  
  var titlePrefix = getParam('debug') == true ? "[debug] " : "";
  var devTitlePrefix = getParam('dev') == true ? "[dev] " : "";
  var error;
  
  if ( getParam('sendMail') !== false ) {
  
    try {
      
      MailApp.sendEmail(
        email,
        devTitlePrefix + titlePrefix + mail.title,
        mail.text,
        { 
        htmlBody: getParam('plainText') == true ? undefined : mail.html
        }
      );
      
    } catch(exception) {
      
      log( exception )
      error = exception;
    }
  
  }
  
  if (callback && typeof(callback) === "function") {
    //Logger.log("ok le callback");
    return callback(error, email, dataForCallback, resultForCallback);
  }
  
  //Logger.log( 'mail :'); Logger.log( email );    
  //{"message":"Limite dépassée : Taille du corps de l'e-mail.","name":"Exception","fileName":"Code","lineNumber":566,"stack":"\tat Code:566 (sendEmail)\n\tat Code:557 (sendGroupedData)\n\tat Code:530 (sendDataTo)\n\tat Code:256 (start)\n"}
}


/**
  * Get grouped mail
*/
function getGroupedMail( data, result ) {
 
  var mail = {
    title: getMailTitle( data.entities, result ),
    html: getMailTemplate( data, result ),
    text: getTextMailTemplate( data, result )
  }
  
  return mail;
}


/**
  * Get separate mails
*/
function getSeparateMails( data, result ) {  
  
  var mails = result.map( function( id ) {
    
    var singleResult = [id];
    var mail = {
      title: getMailTitle( data.entities, singleResult ),
      html: getMailTemplate( data, singleResult ),
      text: getTextMailTemplate( data, singleResult )
    };
    
    return mail;
  })
  
  return mails;
}


/**
  * Mail send grouped results
*/
function mailSendGroupedResults( data, selectedResult, email, callback ) {
  var mail = getGroupedMail( data, selectedResult );
  
  sendEmail(email, mail, callback, data, selectedResult);
}


/**
  * Mail send separate results
*/
function mailSendSeparateResults( data, selectedResult, email, callback ) {  

  var mails = getSeparateMails(data, selectedResult);
  
  for (var i = 0; i < selectedResult.length; i++ ) {
    var mail = mails[i];
    var id = selectedResult[i];
    var singleResult = [id];
    
    sendEmail(email, mail, callback, data, singleResult);    
  }
}


/**
  * Handle Mail send
*/
function handleMailSend( data, selectedResult, email, callback ) {
  
  if ( getParam('groupedResults') ) {

    mailSendGroupedResults(data, selectedResult, email, function(error, callbackRecipient, callbackData, callbackResult) { // 1 : CATCH CALLBACK
      // If grouped mail is too big, try to send in separate results
      if (error) {
        
        mailSendSeparateResults(data, selectedResult, email, callback);
      } else {
        
        if (callback && typeof(callback) === "function") {
          return callback(error, callbackRecipient, callbackData, callbackResult); // 2 : BUT RE-SEND IT
        } 
      }
    });
    
  } else {
    mailSendSeparateResults(data, selectedResult, email, callback);
  }
}
