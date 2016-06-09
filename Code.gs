var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;


var sendMail = true;
//var fake = true;

/**
  * Default Params
*/
var defaultParams = {
  showMap: true,
  limitResults: false,
  useCache: true,
  cacheTime: 1500,
  names: {
    sheet: {
      data: 'Alertes',
      variables: 'Variables',
      test: 'Alertes de test'
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


/**
  * Globals
*/
var globals = {
  
  ads: [],
  mail: {
    ads : [],
    labels: [],
    urls: []
  }
  
};


/**
* TO DO: merge user params with default params
*/
function init(userParams) {

  createMenu();
}


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
function start() {
  
  params = defaultParams; // To do : extend with userParams
  
  // For each value in the url range sheet
  browseRangeName( params.names.range.url, function(key, value) {
    
    var url = value;

    var ads = getUrlAds(url);

    if (ads.length && sendMail) {
      
      //globals.ads.push( ads );
      var storedAdId = Number(getValuesByRangeName( params.names.range.adId )[key]); // Number to prevent strict equality checks
      var firstAdId = ads[0].id;
      
      if(firstAdId !== storedAdId) {
        
        var latestAds = getDataBeforeId(ads, storedAdId);
        var label = getValuesByRangeName( params.names.range.label )[key];
        
        setMailGlobals(latestAds, label, url);
        
        setAdIdValue( key+1, firstAdId );
      }
    } else {
      
      setAdIdValue( key+1, 0 );
    }
    
  });
  
  if ( globals.mail.ads.length && sendMail ) {
    var recipientEmail = getRecipientEmail();
    var data = globals.mail;
    
    sendDataTo( data, recipientEmail );
  }
  
}


/**
  * Browse range name
*/
function browseRangeName(rangeName, callback) {
  
  var key = 1; // because 0 is the header
  
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
  
  /*var cachedUrlContent = getCachedContent(url);
  if (cachedUrlContent) {
    
    listingAds = JSON.parse(cachedUrlContent);   
  } else {
    
    var html = getUrlContent( url );
    listingAds = getListingAdsFromHtml( html );
    
    setCache( url, JSON.stringify(listingAds) );
  }*/
  
  var html = getUrlContent( url );
  listingAds = getListingAdsFromHtml( html );
  
  return listingAds;
}


/**
  * Get cached content
*/
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
*/
function setCache(url, content) {
  var cache = CacheService.getPublicCache();
  cache.put( getUrlHashcode(url), content, params.cacheTime);
}


/**
  * Get url hashcode
*/
function getUrlHashcode( url ) {
  return url.toString().split("/").pop().hashCode().toString();
}


/**
  * Hashcode function
*/
String.prototype.hashCode = function() {
  for(var ret = 0, i = 0, len = this.length; i < len; i++) {
    ret = (31 * ret + this.charCodeAt(i)) << 0;
  }
  return ret;
};


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
        
  // liste des annonces
  $(params.selectors.adItem, params.selectors.adContext, html)
  .each(function(i, element) {
    
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
  
  //Logger.log( data.length );
  
  return data;
    
}


/**
  * Get data before Id
*/
function getDataBeforeId(data, stopId) {
  
  var stopIndex = data.map(function(x) {return x.id; }).indexOf(stopId);

  return data.slice( 0, stopIndex-1 );
}


/**
  * Build mail data
*/
function setMailGlobals(ads, label, url) {
  
  globals.mail.ads.push( ads );
  globals.mail.labels.push( label );
  globals.mail.urls.push( url );
  
}


/**
  * Set Ad id value
*/
function setAdIdValue(row, value) {
  getSheetContext().getRange( row, getColumnByName( params.names.range.adId ) ).setValue( value );
}


/**
  * Get recipient email
*/
function getRecipientEmail() {
   
  var recipientEmail = getValuesByRangeName( params.names.range.recipientEmail )[1];
  
  if (!recipientEmail) {
    
    prompt(params.messages.noEmail);
    
    return;
    
  }
   
  return recipientEmail;
}


/**
  * Send mail Ads to
*/
function sendDataTo( data, email ) {
   
  var mailTitle =  getMailTitle( getAdsTotalLength( data.ads ) );
  var mailHtml = getMailHtml( data );
    
  MailApp.sendEmail(
    email,
    mailTitle,
    'corps',
    { 
      htmlBody: mailHtml 
    }
  );
}


/**
  * Get ads length
*/
function getAdsTotalLength( ads ) {
  var length = 0;
  for (var i = 0; i < ads.length; i++ ) {
    length += ads[i].length;
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
function getMailHtml( data ) {
  
  var html = "";
 
  html += "<body>";
  html += getMailSummaryHtml( data )
  html += getMailListingHtml( data )
  html += "</body>";
  
  return html;
}


/**
  * Get mail summary html
*/
function getMailSummaryHtml( data ) {
    
  var html = "";
  
  var adsTotalLength = getAdsTotalLength(data.ads);
  
  if (adsTotalLength && adsTotalLength > 2) {
  
    html += "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>"+ params.names.mail.summaryTitle +"</p>";
    
    html += "<ul>";
    for (var i = 0; i < data.ads.length; i++ ) {
      if (data.ads[i].length) {
        html += [
          "<li>",
          "  <a href='#"+ params.names.mail.anchorPrefix+i + "'>"+ data.labels[i] +"</a> (" + data.ads[i].length + ")",
            "</li>"
            ].join("\n");
      }
    }
    html += "</ul>";
    
  }
  
  return html;
}


/**
  * Get mail listing html
*/
function getMailListingHtml( data ) {
  
  var html = "";
  
  for (var i = 0; i < data.ads.length; i++ ) {
    if (data.ads[i].length) {
      html += [
        "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>",
        "  " + params.names.mail.researchTitle + " ",
        "  <a name='"+ params.names.mail.anchorPrefix+i + "' href='"+ data.urls[i] + "'>"+ data.labels[i] +"</a> (" + data.ads[i].length + ")",
        "</p>",
        "<ul>"
      ].join("\n");
      
      html += getMailAdsHtml( data.ads[i] );
      
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
      "    "+map,
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
