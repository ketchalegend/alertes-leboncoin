/**
  * ------------------ *
  *  SMS
  * ------------------ *
*/

/**
  * Get Sms Ads Template (multi)
*/
function getSmsAdsTemplate(entities, selectedResult) {

  var template = HtmlService.createTemplateFromFile('smsAdsTemplate');
  var id = selectedResult[0];
  template.label = entities.labels[id].label;
  template.url = entities.urls[id].url;
  template.ads = entities.ads[id].toSend;

  return template.evaluate().getContent();
}


/**
  * Get Sms Ad Template (single)
*/
function getSmsAdTemplate(ad) {
	
  var template = HtmlService.createTemplateFromFile('smsAdTemplate');
  template.ad = ad;
  
  return template.evaluate().getContent();
}


/**
  * Get sms messages
*/
function getSmsMessages(data, selectedResult, maxSmsSendByResult) {
  
  var messages = [];
  var id = selectedResult[0];
  var ads = data.entities.ads[id].toSend;
  
  maxSmsSendByResult = maxSmsSendByResult || params.maxSmsSendByResult;
  
  if (ads.length > maxSmsSendByResult) {
    var message = getSmsAdsTemplate(data.entities, selectedResult);
    messages.push(message);
		
  } else {
    
    for (var i = 0; i < ads.length; i++ ) {    
      var ad = ads[i];      
      var message = getSmsAdTemplate(ad);
      messages.push(message);
			
    }
  }
	
	return messages;
}