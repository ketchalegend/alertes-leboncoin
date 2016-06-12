var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;

var sendMail = true;

/**
  * Default Params
*/
var defaultParams = {
  showMap: false,
  limitResults: false,
  groupedResults: true,
  startIndex: 1,
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
  entities: {}
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
  
  params = deepExtend({}, defaultParams, userParams);
  log(params);
  
  // For each value in the url range sheet
  browseRangeName( params.names.range.url, function(key, value) {
    
    var url = value;
    var ads = getUrlAds(url);

    if (ads.length && sendMail) {
      
      var storedAdId = Number(getValuesByRangeName( params.names.range.adId )[key]); // Number to prevent strict equality checks
      var firstAdId = ads[0].id;
      
      if(firstAdId !== storedAdId) {
        
        var latestAds = (!storedAdId || storedAdId == 0) ? ads : getDataBeforeId(ads, storedAdId);
        var label = getValuesByRangeName( params.names.range.label )[key];
        
        setNormalizedData(key, label, url, latestAds);
      }
    }
  });
  
  // If results, send email
  if ( normalizedData.result.length && sendMail ) {
    
    var recipientEmail = getRecipientEmail();
    var data = normalizedData;
    
    sendDataTo( data, recipientEmail, function(error, result) {

      if (error && error.name == 'Exception') {
        // TODO : manage erroror messages
      } else {
        setAdIdValues( result );
      }
      
    });
  }
  
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
function browseRangeName(rangeName, callback) {
  
  var key = params.startIndex; // because 0 is the header
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
    var $img = $this.find('.item_image');
    var $date = $item_supp.eq( 2 );
    
    var item = {
      id: Number($a.data( "info" ).ad_listid),
      title: $title.text(),
      price: $price.text(),
      place: $place.text(),
      date: $date.text(),
      url: protocol + $a.attr("href"),
      img_src: protocol + $img.find('.lazyload').data("imgsrc")
      
    };
    
    data.push(item);
    
  });
    
  return data;
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
  * Set ad id values
*/
function setAdIdValues( result ) {
  
  for (var i = 0; i < result.length; i++ ) {
    var id = result[i];
    var firstAdId = normalizedData.entities.ads[id].latest[0].id;
    setAdIdValue( id, firstAdId );
  }
  
}

/**
  * Set Ad id value
*/
function setAdIdValue(key, value) {
  getSheetContext().getRange( key+params.startIndex , getColumnByName( params.names.range.adId ) ).setValue( value );
}


/**
  * Get recipient email
*/
function getRecipientEmail() {
   
  var recipientEmail = getValuesByRangeName( params.names.range.recipientEmail )[1];
  
  if (!recipientEmail) {
    
    prompt(params.messages.noEmail);
        
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
    
  var mailTitle =  getMailTitle( getAdsTotalLength( data.result, data.entities ) );
  var mailHtml = getMailHtml( data.result, data.entities );
  
  sendEmail(email, mailTitle, mailHtml, data.result, callback);
  
}


/**
  * Send separated data
*/
function sendSeparatedData( data, email, callback ) {  
  
  for (var i = 0; i < data.result.length; i++ ) {
    
    var id = data.result[i];
    var singleResult = [id];
    
    var mailTitle =  getMailTitle( data.entities.ads[id].latest.length );
    var mailHtml = getMailHtml( singleResult, data.entities );
    
    sendEmail(email, mailTitle, mailHtml, singleResult, callback);
    
  }
  
}


/**
  * Send email
*/
function sendEmail(email, title, htmlBody, result, callback) {
  
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
function getMailTitle( length ) {
  
  return "Alertes leboncoin.fr : " + length + " nouveau" + (length > 1 ? "x" : "") + " résultat" + (length > 1 ? "s" : "");
}


/**
  * Get mail html
*/
function getMailHtml( result, entities ) {
  
  var html = "";
 
  html += "<body>";
  if (result.length && result.length > 1) {
    html += getMailSummaryHtml( result, entities )
  }
  html += getMailListingHtml( result, entities )
  html += "</body>";
  
  return html;
}


/**
  * Get mail summary html
*/
function getMailSummaryHtml( result, entities ) {
    
  var html = "";
  
  html += "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>"+ params.names.mail.summaryTitle +"</p>";
  
  html += "<ul>";
  for (var i = 0; i < result.length; i++ ) {
    
    var id = result[i];
    var label = entities.labels[id].label;
    var url = entities.urls[id].url;
    var ads = entities.ads[id].latest;
    
    if (ads.length) {
      html += [
        "<li>",
        "  <a href='#"+ params.names.mail.anchorPrefix+i + "'>"+ label +"</a> (" + ads.length + ")",
        "</li>"
      ].join("\n");
    }
  }
  html += "</ul>";

  
  return html;
}


/**
  * Get mail listing html
*/
function getMailListingHtml( result, entities ) {
  
  var html = "";
  
  for (var i = 0; i < result.length; i++ ) {
    
    var id = result[i];
    var label = entities.labels[id].label;
    var url = entities.urls[id].url;
    var ads = entities.ads[id].latest;
    
    if (ads.length) {
      html += [
        "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>",
        "  " + params.names.mail.researchTitle + " ",
        "  <a name='"+ params.names.mail.anchorPrefix+i + "' href='"+ url + "'>"+ label +"</a> (" + ads.length + ")",
        "</p>",
        "<ul>"
      ].join("\n");
      
      html += getMailAdsHtml( ads );
      
      html += "</ul>";
    }
    
  }
  
  return html;
}


/**
  * Get mail ads html
*/
function getMailAdsHtml( ads ) {
  
  var html = "";
  
  for (var i = 0; i < ads.length; i++) {
    
    var ad = ads[i];
    
    if (params.showMap) {
     var map =  "<img style='float:right; padding-left:10px;' src='https://maps.googleapis.com/maps/api/staticmap?markers=" + encodeData(ad.place) + "&zoom=7&size=120x120&sensor=false&language=fr&sensor=false' />";
    }
    
    html += [
      "<li style='list-style:none;margin-bottom:20px;clear:both;background:#EAEBF0;border-top:1px solid #ccc;'>",
      "  <div style='float:left;width:auto;padding:20px 0;'>",
      map,
      "    <a href='" + ad.url + "'>",
      "      <img src='" + ad.img_src + "' />",
      "    </a>",
      "    <div style='float:left;width:400px;padding:10px 0;'>",
      "      <a style='font-size:14px;font-weight:bold;color:#369;text-decoration:none;' href='" + ad.url + "'>",
      "        " + ad.title,
      "      </a>",
      "      <div>",
      "        " + ad.place,
      "      </div>",
      "      <div>",
      "        " + ad.date,
      "      </div>",
      "      <div style='line-height:18px;font-size:14px;font-weight:bold;'>",
      "        " + ad.price,
      "      </div>",
      "  </div>",
      "</li>"
    ].join("\n");
    
  }
    
  return html; 
}


/**
  * Encode data
*/
function encodeData(s) {
  if (s) {
  var s = s.trim().replace(/\s\s+/g, '+');
    return encodeURIComponent(s);
  }
}


/**
  * Notify user by a popup
*/
var prompt = function(message) {
  
  Browser.msgBox( message );
}


/**
  * Get full range name
*/
function getFullRangeName( rangeName ) {
  
  return names.sheet.data + '!' + rangeName;
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




/**
  * CACHE CODE PARTS : since performance increase, cache is not necessary, but keeped here for potential future needs.
*/

/**
  * Get url ads

function getUrlAds(url) {
  
  var listingAds;
  
  if (params.useCache) {
    
    var cachedUrlContent = getCachedContent(url);
    if (cachedUrlContent) {
      
      listingAds = JSON.parse(cachedUrlContent);   
    }
  }
  if ( (params.useCache && !cachedUrlContent) || !params.useCache) {
    
    var html = getUrlContent( url );
    listingAds = getListingAdsFromHtml( html );   
  }
  if ( params.useCache && cachedUrlContent ) {
    
    setCache( url, JSON.stringify(listingAds) );
  }
  
  return listingAds;
}

/**
  * Get cached content

function getCachedContent(url) {
  
  var cache = CacheService.getPublicCache();
  var cached = cache.get( getUrlHashcode(url) );
  
  if (cached != null) {
    return cached;
  } else {
    return false;
  }
}


/**
  * Set cache

function setCache(url, content) {
  var cache = CacheService.getPublicCache();
  cache.put( getUrlHashcode(url), content, params.cacheTime);
}


/**
  * Get url hashcode

function getUrlHashcode( url ) {
  return url.toString().split("/").pop().hashCode().toString();
}


/**
  * Hashcode function

String.prototype.hashCode = function() {
  for(var ret = 0, i = 0, len = this.length; i < len; i++) {
    ret = (31 * ret + this.charCodeAt(i)) << 0;
  }
  return ret;
};

/**
  * END CACHE CODE PARTS
*/
