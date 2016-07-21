var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;

var version = "4.3.2";
var sendMail = true;

/**
  * Default Params
*/
var defaultParams = {
  debug: false,
  showMap: false,
  mapZoom: 7,
  groupedResults: true,
  startIndex: 2,
  dateFormat: {
    human: 'd MMM, HH:mm',
    iso: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  },
  colors: {
    background: {
      working: '#ECEFF1',
      success: '#DCEDC8'
    },
    border: {
      working: '#B0BEC5'
    }
  },
  names: {
    sheet: {
      data: 'Alertes',
      variables: 'Variables',
      test: 'Alertes de test',
      debug: 'debug'
    },
    range: {
      label: 'labelRange',
      url: 'urlRange',
      adId: 'adIdRange',
      recipientEmail: 'emailRange'
    },
    mail: {
      researchTitle : 'Votre recherche :',
      summaryTitle: 'Accès rapide :',
      anchorPrefix: 'part-'
    }
  },
  messages: {
    noEmail: "Merci d'indiquer votre email dans la feuille intitulée 'variables' en bas"
  },
  selectors: {
    adItem: '.mainList ul > li',
    adsContext: '#listingAds'
  }
};

var params;

var normalizedData = {
  result: [],
  entities: {},
  update: false
};


/**
* Init
*/
function init(userParams) {
  
  // params = deepExtend({}, defaultParams, userParams);
  createMenu();
}


/**
  * Mimic jquery Extend function
*/
function extend() {
  for(var i=1; i<arguments.length; i++)
    for(var key in arguments[i])
      if(arguments[i].hasOwnProperty(key))
        arguments[0][key] = arguments[i][key];
  return arguments[0];
}


/**
  * Deep extend
*/
function deepExtend(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj)
      continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object')
          out[key] = deepExtend(out[key], obj[key]);
        else
          out[key] = obj[key];
      }
    }
  }

  return out;
};


/**
  * Create menu
*/
function createMenu() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Alertes LeBonCoin')
      .addItem('Lancer manuellement', 'alertesLeBonCoin')
      .addToUi();
}


/**
  * Start, everything start from here
*/
function start(userParams) {
  
  log(userParams);
  params = deepExtend({}, defaultParams, userParams);
  
  
  // For each value in the url range sheet
  forEachValueInRange( params.names.range.url, function(key, value) {
    
    var index = key+params.startIndex-1; // because array keys & spreadsheet indexes aren't the same
    
    var cell = getCellByIndex(index, params.names.range.adId);   
    var row = getRowByIndex(index, params.names.range.adId);
    row.setBorder(true, true, true, true, false, false, params.colors.border.working, null);
    row.setBackground( params.colors.background.working );
    SpreadsheetApp.flush(); // see https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#flush
    
    var url = value;
    var ads = getUrlAds(url);

    if (ads.length && sendMail) {
      
      var latestAdCellValue = getCellByIndex( index, params.names.range.adId ).getValue();
      var latestAds = getLatestAds(ads, latestAdCellValue);
      
      if (latestAds.length) {
        
        var label = getCellByIndex( index, params.names.range.label ).getValue();
        setNormalizedData(index, label, url, latestAds);
      }
    }
    
    row.setBorder(false, false, false, false, false, false);
    row.setBackground('');
    SpreadsheetApp.flush();
    
  });
  
  
  var update = checkForUpdates();
  if ( update ) {
    normalizedData.update = update;
  }
  
  
  var data = normalizedData;
  
  // If results, send email
  if ( data.result.length && sendMail ) {
    
    var recipientEmail = getRecipientEmail();
    
    sendDataTo( data, recipientEmail, function(error, result) {

      if (error && error.name == 'Exception') {
        // TODO : manage erroror messages
      } else {
        
        if (params.debug == false) {
          forEachResult( result, data.entities, setLatestAdRangeValue );  
        } 
        
      }
      
    });
  }
    
}


/**
  * Get latest ads (based on stored value)
*/
function getLatestAds(ads, latestAdValue) {
  
  var latestAds = [];
   
  var latestAdStoredTimestamp = null;
  if (typeof latestAdValue.getTime === 'function') {
    latestAdStoredTimestamp = latestAdValue.getTime();
  }
  
  var latestAdTimestamp = ads[0].timestamp;
  
  if (latestAdTimestamp !== latestAdStoredTimestamp) {
    
    if (latestAdStoredTimestamp) {
      log('TIMESTAMP');
      latestAds = getDataBeforeTime(ads, latestAdStoredTimestamp);
      
    } else if( Number(latestAdValue) !== 0 ) {
      log('ID');
      latestAds = getDataBeforeId(ads, Number(latestAdValue) ); // deprecated, replaced by getDataBeforeTime
      
    } else {
      log('ALL');
      latestAds = ads;
    }
  }
  
  var latestAdsSorted = latestAds.sort( dynamicSort("-timestamp") );
  
  return latestAdsSorted;
}


/**
  * Dynamic Sort
*/
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


/**
  * Set latest Ad value
*/
function setLatestAdRangeValue(index, entities) {
  
  var latestAdDate = new Date( entities.ads[index].latest[0].timestamp );
  var adIdRange = getSheetContext().getRange( index, getColumnByName( params.names.range.adId ) );
  
  adIdRange.setValue( latestAdDate );
  adIdRange.setNumberFormat( params.dateFormat.human );
  adIdRange.setBackground( params.colors.background.success );  
}


/**
  * Check for updates
*/
function checkForUpdates() {
  
  var update = false;
  var url = "https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/version.json";
  
  try {
    var response = UrlFetchApp.fetch(url);
    var data = JSON.parse(response.getContentText());

    if ( versionCompare( data.version, version ) == 1) {
      
      update = data;
    }
  } catch(e) {
    // handle error
  }
    
  return update;
}


/**
  * Set normalized data (inspired by redux & normalizr principles)
*/
function setNormalizedData(key, label, url, latestAds) {
 
  // Push new result
  normalizedData.result.push( key );
        
  // Because GAS is not ecmascript 6, we need to use this method to set dynamic object names...
  var obj = {}; obj[key] = {};
  var labels = extend({}, obj);
  var urls = extend({}, obj);
  var ads = extend({}, obj);          
  
  // Extend Labels
  labels[key] = {
    id: key,
    label: label 
  }
  labels = extend({}, normalizedData.entities.labels, labels);  
  
  // Extend urls
  urls[key] = {
    id: key,
    url: url
  }
  urls = extend({}, normalizedData.entities.urls, urls);
  
  // Extend ads
  ads[key] = {
    id: key,
    latest: latestAds
  }
  ads = extend({}, normalizedData.entities.ads, ads);
  
  // Extend entities
  normalizedData.entities = extend({}, normalizedData.entities, {
    labels: labels,
    urls: urls,
    ads: ads
  });
  
}


/**
  * Browse range name
*/
function forEachValueInRange(rangeName, callback) {
  var key = params.startIndex-1; // because 1 is the header
  var rangeArray = getValuesByRangeName(rangeName);

  while( (value = rangeArray[key]) != "" ) {
    
    if (callback && typeof(callback) === "function") {
      callback(key, value);
    }

    key++;
  }
}


/**
  * Get values by range name
*/
function getValuesByRangeName(rangeName, asString) {
  // raw 
  var asString = asString || true;
  
  //— for example, getRangeByName('TaxRates') or getRangeByName('Sheet Name!TaxRates'), but not getRangeByName('"Sheet Name"!TaxRates').
  var range = getSpreadsheetContext().getRangeByName(rangeName);
  
  if (asString) {
    return range.getDisplayValues();
  } else {
    return range.getValues();
  }
  
}

/**
  * Get row by index
*/
function getRowByIndex( index, rangeName ) {
  
  return getSheetContext().getRange(index, 1, 1, getColumnByName( rangeName ) );
}

/**
  * Get cell by index
*/
function getCellByIndex( index, rangeName ) {
  
  return getSheetContext().getRange(index, getColumnByName( rangeName ) );
}


/**
  * Get range by name
*/
function getRangeByName( rangeName ) {
      
  return getSpreadsheetContext().getRangeByName( rangeName );
}


/**
  * Get column by name
*/
function getColumnByName( rangeName ) {
      
  return getSpreadsheetContext().getRangeByName( rangeName ).getColumn();
}


/**
  * Get spreadsheet context
*/
function getSpreadsheetContext() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return ss;
}


/**
  * Get sheet context
*/
function getSheetContext() {
  var sheet = getSpreadsheetContext().getSheetByName( params.names.sheet.data );
  
  return sheet;
}


/**
  * Get url ads
*/
function getUrlAds(url) {
  
  var listingAds;
  
  var html = getUrlContent( url );
  listingAds = getListingAdsFromHtml( html );
  
  return listingAds;
}


/**
  * Get url content
*/
function getUrlContent(url) {

  return UrlFetchApp.fetch(url).getContentText("iso-8859-15");
}


/**
  * Get listing ads data
  * @returns {Object} Returns data of the listing ads
*/
function getListingAdsFromHtml( html ) {  
  
  var data = [];
  var protocol = 'https:';
  
  var mainHtml = extractMainHtml(html); // get only the needed part, for cheerio performance
  
  /*var start1 = new Date().getTime();
  var end1 = new Date().getTime();
  log( start1 - end1 );*/
  
  var $selector = $(params.selectors.adItem, params.selectors.adContext, mainHtml);
        
  // liste des annonces
  $selector.each(function(i, element) {
    
    // limiter le nombre de résultats
    /*if (params.limitResults) {
      if (i >= params.limitResults) {
        return;
      }
    }*/
    
    var $this = $(this);
    
    var $a = $this.find('a');
    
    var $item_supp = $this.find('.item_supp');
    
    var $title = $this.find('.item_title');
    var $price = $this.find('.item_price');
    var $place = $item_supp.eq( 1 );
    var $img = $this.find('.item_image').find('.lazyload');    
    var $date = $item_supp.eq( 2 );
        
    var item = {
      id: Number($a.data( "info" ).ad_listid),
      title: $title.text().trim(),
      price: $price.text(),
      place: $place.text(),
      date: $date.text(),
      url: protocol + $a.attr("href"),
      img: {
        src: addProtocol( $img.data("imgsrc") )
      }
      
    };
    
    // A real Date Object with milliseconds based on Ad Id to prevent conflicts
    item.timestamp = getAdDateTime( item.date, item.id ).getTime();
        
    data.push(item);
    
  });
    
  return data;
}


/**
  * Add protocol (https)
*/
function addProtocol(url) {
   if ( url && !/^(f|ht)tps?:\/\//i.test(url) ) {
      url = "https:" + url;
   }
   return url;
}


/**
  * Extract main html
*/
function extractMainHtml(html){
  
  var mainStartTag = '<main id="main"';
  var mainEndTag = '</main>';
  
  var from = html.indexOf(mainStartTag) + mainStartTag.length;
  var to = html.indexOf(mainEndTag, from)
  
  var mainHtml = html.substring( from, to );
  
  return mainHtml;
}


/**
  * Get data before Id
*/
function getDataBeforeId(data, stopId) {
  
  var stopIndex = data.map(function(x) {return x.id; }).indexOf(stopId);

  return data.slice( 0, stopIndex );
}

/**
  * Get data before time
*/
function getDataBeforeTime(data, lastTime) {
  
  var reducedData = [];
  
  data.map(function(item) {
    
    if (item.timestamp > lastTime) {
      reducedData.push( item );
    }
  });

  return reducedData;
}


/**
  * For each result
*/
function forEachResult( result, entities, callback ) {
  
  for (var i = 0; i < result.length; i++ ) {
    var index = result[i];
    
    if (callback && typeof(callback) === "function") {
      callback(index, entities);
    }
    
  }
}


/**
  * Get recipient email
*/
function getRecipientEmail() {
   
  var recipientEmail = getValuesByRangeName( params.names.range.recipientEmail )[1][0];
  
  if (recipientEmail.length == 0) {
    log(params.messages.noEmail);
    //prompt(params.messages.noEmail);
  }
   
  return recipientEmail;
}


/**
  * Send mail Ads to
*/
function sendDataTo( data, email, callback ) {
  
  
  if (params.groupedResults) {
    
    sendGroupedData(data, email, function(error, result) {
      if (error) {
        sendSeparatedData(data, email, callback);
      } else {
        
        if (callback && typeof(callback) === "function") {
          return callback(error, result);
        } 
      }
    });
    
  } else {
    
    sendSeparatedData(data, email, callback);
  }
}


/**
  * Send grouped data
*/
function sendGroupedData( data, email, callback ) {
    
  var mailTitle =  getMailTitle( data.result, data.entities );
  var mailHtml = getMailTemplate( data.result, data.entities, data.update );
  
  sendEmail(email, mailTitle, mailHtml, data.result, callback);
  
}


/**
  * Send separated data
*/
function sendSeparatedData( data, email, callback ) {  
  
  for (var i = 0; i < data.result.length; i++ ) {
    
    var id = data.result[i];
    var singleResult = [id];
    
    var mailTitle =  getMailTitle( singleResult, data.entities );
    var mailHtml = getMailTemplate( singleResult, data.entities, data.update );
    
    sendEmail(email, mailTitle, mailHtml, singleResult, callback);
    
  }
  
}


/**
  * Send email
*/
function sendEmail(email, title, htmlBody, result, callback) {
  
  if (params.debug == true) {
    title = "[debug] " + title;
  }
  
  var error;
  
  try {

    MailApp.sendEmail(
      email,
      title,
      'corps',
      { 
        htmlBody: htmlBody 
      }
    );
    
  } catch(exception) {
    
    log( exception )
    error = exception;
  }
  
  if (callback && typeof(callback) === "function") {
    return callback(error, result);
  }
  //{"message":"Limite dépassée : Taille du corps de l'e-mail.","name":"Exception","fileName":"Code","lineNumber":566,"stack":"\tat Code:566 (sendEmail)\n\tat Code:557 (sendGroupedData)\n\tat Code:530 (sendDataTo)\n\tat Code:256 (start)\n"}
}


/**
  * Get ads length
*/
function getAdsTotalLength( result, entities ) {
  var length = 0;
  for (var i = 0; i < result.length; i++ ) {
    var id = result[i];
    length += entities.ads[id].latest.length;
  }
  return length;
}


/**
  * Get mail title
*/
function getMailTitle( result, entities ) {
  
  var length = getAdsTotalLength( result, entities );
  
  var prefixTitle = 'Alertes leboncoin.fr : ';
  var suffixTitle = '';
  
  if (result.length == 1) {
    suffixTitle = ' pour "' + entities.labels[result[0]].label + '"'
  }
  if (result.length > 1) {
    suffixTitle = ' (groupés)'
  }
  
  
  return prefixTitle + length + "\xa0nouveau" + (length > 1 ? "x" : "") + " résultat" + (length > 1 ? "s" : "") + suffixTitle;   
}


/*
  * Get mail template
*/
function getMailTemplate(result, entities, update) {
  
  var template = HtmlService.createTemplateFromFile('mailTemplate');
  template.result = result;
  template.entities = entities;
  template.update = update;
  
  return template.evaluate().getContent();
}


/*
  * Get mail preheader template
*/
function getMailPreheaderTemplate(result, entities) {
  
  var template = HtmlService.createTemplateFromFile('mailPreheaderTemplate');
  template.result = result;
  template.entities = entities;
  
  return template.evaluate().getContent();
}


/*
  * Get mail summary template
*/
function getMailSummaryTemplate(result, entities) {
  
  var template = HtmlService.createTemplateFromFile('mailSummaryTemplate');
  template.result = result;
  template.entities = entities;
  
  return template.evaluate().getContent();
}


/*
  * Get mail listing template
*/
function getMailListingTemplate( result, entities ) {
  
  var template = HtmlService.createTemplateFromFile('mailListingTemplate');
  template.result = result;
  template.entities = entities;
  
  return template.evaluate().getContent();
}


/*
  * Get mail ads template
*/
function getMailAdsTemplate( ads ) {
  
  var template = HtmlService.createTemplateFromFile('mailAdsTemplate');
  template.ads = ads;
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


/**
  * Notify user by a popup
*/
function prompt(message) {
  
  Browser.msgBox( message );
}


/**
  * Get full range name
*/
function getFullRangeName( rangeName ) {
  
  return names.sheet.data + '!' + rangeName;
}


/**
  * Get Ad Date Time (with adId param to generate milliseconds)
*/
var getAdDateTime = function(adDateTime, adId) {
  
  // Date is now
  var d = new Date();
  // Reset seconds and milliseconds because of Ad Id magic trick
  d.setSeconds(0);
  d.setMilliseconds(0);
  
  var dateTimeSeparator = adDateTime.indexOf(',');
  var dateString = adDateTime.substring(0, dateTimeSeparator).trim().toLowerCase();
  var timeString = adDateTime.substring(dateTimeSeparator + 1).trim();
  var timeSeparator = timeString.indexOf(":");
  var dateSeparator = dateString.indexOf(" ");
  
  // Month, Day
  var month;
  var day;
  switch( dateString ) {
      case "aujourd'hui":
          var today = d;
          month = today.getMonth();
          day = today.getDate();
          break;
      case "hier":
          var yesterday = new Date( d.setDate(d.getDate() - 1) );
          month = yesterday.getMonth();
          day = yesterday.getDate();
          break;
      default:
          var monthString = dateString.substring(dateSeparator + 1);
          var dayString = dateString.substring(0, dateSeparator);
          month = getMonthNumber( monthString );
          day = Number( dayString );
  }
  
  // Hours, minutes
  var hours = Number(timeString.substring(0, timeSeparator));
  var minutes = Number(timeString.substring(timeSeparator + 1));
  
  // Milliseconds based on Ad Id (magic trick)
  var milliseconds = getMillisecondsByMagic( adId );
  
  d.setMonth( month );
  d.setDate( day );
  d.setHours( hours );
  d.setMinutes( minutes );
  d.setMilliseconds( milliseconds );
  
  var date;
  
  if ( typeof d.getMonth === 'function' ) {
    date = d;
  }
  
  //log(date);
  return date;
}


/**
  * Get month number
*/
function getMonthNumber(month) {
    
  var months = ["jan", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
  var fullMonths = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  
  var monthNumber = months.indexOf( month );
  var fullMonthNumber = fullMonths.indexOf( month );
  
  var number = (monthNumber >= 0) ? monthNumber : fullMonthNumber;
      
  return number;
}


/**
  * Get last digits
*/
function getLastDigits(number, count) {
  
  var stringNumber = number.toString();
  var length = stringNumber.length;
  var lastDigits = Number( stringNumber.slice(length-count, length) );
  
  return lastDigits;
}


/**
  * Get milliseconds by magic
*/
function getMillisecondsByMagic(id) {

  var secondInMilliseconds = 60000-1;
  var idInMilliseconds = getLastDigits(id,4); // fake, but that's the trick (needs 10000 consecutive ads with same dateTime to fail...)
  var milliseconds = secondInMilliseconds - idInMilliseconds;
  
  return milliseconds;
}


/*
 * Version compare
 * @author Alexey Bass (albass)
 */
versionCompare = function(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;
    
    var a = left.split('.')
    ,   b = right.split('.')
    ,   i = 0, len = Math.max(a.length, b.length);
        
    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
        }
    }
    
    return 0;
}


function sortObjectProperties(obj, sortValue, reverse){
  
  var keysSorted;
  if (reverse) {
    keysSorted = Object.keys(obj).sort(function(a,b){return obj[b][sortValue]-obj[a][sortValue]});
  } else {
    keysSorted = Object.keys(obj).sort(function(a,b){return obj[a][sortValue]-obj[b][sortValue]});
  }
  
  var objSorted = {};
  for(var i = 0; i < keysSorted.length; i++){
    objSorted[keysSorted[i]] = obj[keysSorted[i]];
  }
  return objSorted;
}


/**
  * Log
*/
function log(value, stringify) {
  if (stringify == false) {
    Logger.log ( value );
  }
  return Logger.log( JSON.stringify(value) ); 
 
}
