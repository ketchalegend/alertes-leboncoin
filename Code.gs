var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;

var params = {
  names: {
    sheet: {
      data: 'Alertes',
      variables: 'Variables'
    },
    range: {
      label: 'labelRange',
      url: 'urlRange',
      adId: 'adIdRange',
      recipientEmail: 'emailRange'
    }
  }
};

var globals = {
  
  ads: [],
  mail: {
    ads : [],
    labels: [],
    urls: [],
    anchorPrefix: 'part-'
  },
  message: {
    noEmail: "Merci d'indiquer votre email dans la feuille intitulée 'variables' en bas"
  }
  
};


function createMenu() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Alertes LeBonCoin')
      .addItem('Lancer manuellement', 'alertesLeBonCoin')
      .addToUi();
}


/**
* TO DO: merge user params with default params
*/
function init(userParams) {
  createMenu();
}


/**
* TO DO: return params
*/
function getParams() {
  
}


/**
  * Start, everything start from here
*/
function start(userParams) {

  var sendMail = true;
  
  // For each value in the url range sheet
  browseRangeName( params.names.range.url, function(key, value) {
    
    var url = value;
    
    var cachedUrlContent = getCachedContent(url);
    
    if (cachedUrlContent) {
      
      var listingAds = JSON.parse(cachedUrlContent);   
    } else {
      
      var html = getUrlContent( url );
      var $listingAds = getListingAds( html );
      var listingAds = getListingAdsData( $listingAds );  
      setCache( url, JSON.stringify(listingAds) );
    }

    if (listingAds.length) {
      
      //globals.ads.push( listingAds );
      
      if ( sendMail ) {
              
        var storedAdId = Number(getValuesByRangeName( params.names.range.adId )[key]); // Number to prevent strict equality checks
        var firstAdId = listingAds[0].id;
        
        if(firstAdId !== storedAdId) {
          
          var latestAds = getDataBeforeId(listingAds, storedAdId);
          var label = getValuesByRangeName( params.names.range.label )[key];
          
          buildMailData(latestAds, label, url);
          
          setAdIdValue( key+1, firstAdId );
        }
      }
    } else {
      
      setAdIdValue( key+1, 0 );
    }
    
  });
  
  if ( globals.mail.ads.length && sendMail ) {
    var recipientEmail = getRecipientEmail();
    sendMailAdsTo( recipientEmail );
  }
  
}


/**
  * Set Ad id value
*/
function setAdIdValue(row, value) {
  getSheetContext().getRange( row, getColumnByName( params.names.range.adId ) ).setValue( value );
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
  * Get column by name
*/
function getColumnByName( rangeName ) {
      
  return getSpreadsheetContext().getRangeByName( rangeName ).getColumn();
}


/**
  * Get full range name
*/
function getFullRangeName( rangeName ) {
  
  return names.sheet.data + '!' + rangeName;
}


/**
  * Build mail data
*/
function buildMailData(ads, label, url) {
  
  globals.mail.ads.push( ads );
  globals.mail.labels.push( label );
  globals.mail.urls.push( url );
  
}


/**
  * Send mail Ads to
*/
function sendMailAdsTo( email ) {
  
  var mailTitle =  getMailTitle( globals.mail.ads.length );
  var mailHtml = getMailHtml( globals.mail );
    
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
  if (data.ads.length > 1) {
    html += getMailSummaryHtml( data )
  }
  html += getMailListingHtml( data )
  html += "</body>";
  
  return html;
}


/**
  * Get mail summary html
*/
function getMailSummaryHtml( data ) {
    
  var html = "";
  
  html += "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>Accès rapide :</p>";
  
  html += "<ul>";
  for (var i = 0; i < data.ads.length; i++ ) {
    if (data.ads[i].length) {
      html += [
        "<li>",
        "  <a href='#"+ data.anchorPrefix+i + "'>"+ data.labels[i] +"</a> (" + data.ads[i].length + ")",
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
function getMailListingHtml( data ) {
  
  var html = "";
  
  for (var i = 0; i < data.ads.length; i++ ) {
    if (data.ads[i].length) {
      html += [
        "<p style='display:block;clear:both;padding-top:20px;font-size:14px;'>",
        "  Votre recherche : ",
        "  <a name='"+ data.anchorPrefix+i + "' href='"+ data.urls[i] + "'>"+ data.labels[i] +"</a> (" + data.ads[i].length + ")",
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
    
    html += [
      "<li style='list-style:none;margin-bottom:20px;clear:both;background:#EAEBF0;border-top:1px solid #ccc;'>",
      "  <div style='float:left;width:auto;padding:20px 0;'>",
      "    <img style='float:right; padding-left:10px;' src='https://maps.googleapis.com/maps/api/staticmap?markers=" + encodeData(ad.place) + "&zoom=7&size=120x120&sensor=false&language=fr&sensor=false' />",
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
  * Get data before Id
*/
function getDataBeforeId(data, stopId) {
  
  var stopIndex = data.map(function(x) {return x.id; }).indexOf(stopId);

  return data.slice( 0, stopIndex-1 );
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
  * Get recipient email
*/
function getRecipientEmail() {
   
  var recipientEmail = getValuesByRangeName( params.names.range.recipientEmail )[1];
  
  if (!recipientEmail) {
    
    prompt(globals.message.noEmail);
    
    return;
    
  }
   
  return recipientEmail;
}


/**
  * Notify user by a popup
*/
var prompt = function(message) {
  
  Browser.msgBox( message );
}


/**
  * Get listing Ads
  * @returns {Object} Returns a cheerio object of the listing ads
*/
function getListingAds(html) {
    
  var $listingAds = $('.mainList ul > li', '#listingAds', html);
  
  return $listingAds;
}


/**
  * Get listing ads data
  * @returns {Object} Returns data of the listing ads
*/
function getListingAdsData( $listingAds ) {  
  
  var data = [];
  var protocol = 'https:';
        
  // liste des annonces
  $listingAds.each(function(i, element){
    
    // limiter le nombre de résultats
    /*if (i >= 10) {
      return;
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
  * Get url content
*/
function getUrlContent(url) {

  return UrlFetchApp.fetch(url).getContentText("iso-8859-15");
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


function getUrlHashcode( url ) {
  return url.toString().split("/").pop().hashCode().toString() + "aaa";
}

function getCachedContent(url) {
    var cache = CacheService.getPublicCache();
    var cached = cache.get( getUrlHashcode(url) );

  Logger.log(cached);
  
    if (cached != null) {
      return cached;
    } else {
     return false;
    }
    
}

function setCache(url, content) {
  var cache = CacheService.getPublicCache();
  cache.put( getUrlHashcode(url), content, 1500);
}

String.prototype.hashCode = function() {
  for(var ret = 0, i = 0, len = this.length; i < len; i++) {
    ret = (31 * ret + this.charCodeAt(i)) << 0;
  }
  return ret;
};
