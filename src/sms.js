/**
  * ------------------ *
  *  SMS
  * ------------------ *
*/

/**
  * Get Sms Ads Template (multi)
*/
function getSmsAdsTemplate( entities, result ) {
  
  var template = HtmlService.createTemplateFromFile('smsAds.tpl');
  var id = result[0];
  template.label = entities.labels[id].label;
  template.url = entities.urls[id].url;
  template.ads = entities.ads[id].toSend;

  return template.evaluate().getContent();
}


/**
  * Get Sms Ad Template (single)
*/
function getSmsAdTemplate(ad) {
	
  var template = HtmlService.createTemplateFromFile('smsAd.tpl');
  template.ad = ad;
  
  return template.evaluate().getContent();
}


/**
  * Get sms messages
*/
function getSmsMessages(data, result, maxSmsSendByResult) {
  
  var messages = [];
  var id = result[0];
  var ads = data.entities.ads[id].toSend;
  
  maxSmsSendByResult = maxSmsSendByResult || getParam('maxSmsSendByResult');
  
  if (ads.length > maxSmsSendByResult) {
    var message = getSmsAdsTemplate(data.entities, result);
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