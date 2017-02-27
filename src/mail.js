/**
  * ------------------ *
  *  MAIL
  * ------------------ *
*/


/**
  * Get mail title
*/
function getMailTitle( entities, result ) {
  
  var length = getAdsTotalLength( entities, result );
  
  var onlyProAds = true;
  for (var i = 0; i < result.length; i++ ) {
    var id = result[i];
    var ads = entities.ads[id].toSend;
    
    if (ads.length) {
      for (var j = 0; j < ads.length; j++ ) {
        var ad = ads[j];
        if ( !ad.isPro ) { onlyProAds = false; }
      }
    }
  }
  
  var prefixTitle = 'Alertes leboncoin.fr : ';
  var suffixTitle = '';
  
  if (result.length == 1) {
    suffixTitle = ' pour "' + entities.labels[result[0]].label + '"'
  }
  if (result.length > 1) {
    suffixTitle = ' (groupés)'
  }
  
  var pluralS = ads.length > 1 ? 's' : '';
  
  return prefixTitle + length + "\xa0nouveau" + (length > 1 ? "x" : "") + " résultat" + pluralS + (onlyProAds ? " (pro)" : "") + suffixTitle;   
}


/**
  * Get ads length
*/
function getAdsTotalLength( entities, result ) {
  var length = 0;
  for (var i = 0; i < result.length; i++ ) {
    var id = result[i];
    length += entities.ads[id].toSend.length;
  }
  return length;
}



/*
  * Get mail template
*/
function getMailTemplate( data, result ) {
  
  var template = HtmlService.createTemplateFromFile('mail.tpl');
  template.result = result;
  template.data = data;
  
  return template.evaluate().getContent();
}


/*
  * Get mail text template
*/
function getTextMailTemplate( data, result ) {
  
  var template = HtmlService.createTemplateFromFile('mailText.tpl');
  template.data = data;
  template.result = result;
  
  return template.evaluate().getContent();
}


/*
  * Get mail preheader template
*/
function getMailPreheaderTemplate( entities, result ) {
  
  var template = HtmlService.createTemplateFromFile('mail__preheader.tpl');
  template.entities = entities;
  template.result = result;
  
  return template.evaluate().getContent();
}


/*
  * Get mail summary template
*/
function getMailSummaryTemplate( entities, result ) {
  
  var template = HtmlService.createTemplateFromFile('mail__summary.tpl');
  template.entities = entities;
  template.result = result;
  
  return template.evaluate().getContent();
}


/*
  * Get mail listing template
*/
function getMailListingTemplate( entities, result ) {
  
  var template = HtmlService.createTemplateFromFile('mail__listing.tpl');
  template.entities = entities;
  template.result = result;
  
  return template.evaluate().getContent();
}


/*
  * Get mail ads template
*/
function getMailAdsTemplate( ads, singleParams ) {
  
  var template = HtmlService.createTemplateFromFile('mail__ads.tpl');
  template.ads = ads;
  template.singleParams = singleParams;
  return template.evaluate().getContent();
}


/**
  * Encode data
  * TODO : refactor
*/
function encodeForStaticMapApi(s) {
  if (s) {
  var s = s.trim().replace(/\s\s+/g, '+').replace(/[!'()*]/g, '+');
    //return encodeURIComponent(s);
    return s;
  }
}



