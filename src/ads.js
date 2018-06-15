/**
  * ------------------ *
  *  ADS
  * ------------------ *
*/

/**
  * Get ads from url
*/
function getHtmlContentFromUrl( url ) {
  
  var htmlContent = {};
  
  // Cache is only necessary when debugging with large datasets
  if ( getParam('useCache') ) {
    var cachedUrlContent = getCachedContent( url );
    if ( cachedUrlContent ) {
      htmlContent = JSON.parse( cachedUrlContent );
      getSpreadsheetContext().toast('Récupération du cache');
    }
  }
  if ( (  getParam('useCache') && !cachedUrlContent) || !getParam('useCache') ) {
    
    var html = getUrlContent( url );

    htmlContent = {
      main: getMainHtml( html ),
      json: getJSONDataHtml( html ),
      tags: getTagDataHtml( html )
    };

  }
  if ( getParam('useCache') && !cachedUrlContent ) {
    setCache( url, JSON.stringify( htmlContent ));
    getSpreadsheetContext().toast('Mise en cache');
  }
  
  return htmlContent;
}


/**
  * Get Main Html
*/
function getMainHtml( html ) {
  var mainHtml = extractHtml(html, getParam('selectors').mainStartTag, getParam('selectors').mainEndTag, getParam('selectors').mainStartTag.length );
  
  return mainHtml;
}


/**
  * Get Tag Data Html
*/
function getTagDataHtml( html ) {
  var startTag = 'var utag_data = '
  var endTag = '</script>';
  
  var tagDataHtml = extractHtml(html, startTag, endTag, 0, endTag.length).trim();
  
  return tagDataHtml;
}

/**
  * Get JSON Data Html
*/
function getJSONDataHtml( html ) {
  var startTag = 'window.FLUX_STATE = '
  var endTag = '</script>';
  
  var JSONDataHtml = extractHtml(html, startTag, endTag, startTag.length, 0).trim();
  
  return JSONDataHtml;
}


/**
  * Get Main JSDOM
*/
function getMainJSDOM( html ) {
  var $main = $( getParam('selectors').adItem, getParam('selectors').adContext, html );
  //var $main = $('li[itemtype="http://schema.org/Offer"]', getParam('selectors').adContext, html); // reference
  //var $main = $('.mainList ul > li', getParam('selectors').adContext, html); // same
  //var $main = $('.mainList li[itemtype="http://schema.org/Offer"]', getParam('selectors').adContext, html); // same
  //var $main = $('.mainList', getParam('selectors').adContext, html).find('li'); // slower
  //var $main = $('#listingAds .mainList ul > li', html); // 
  
  return $main;
}


/**
  * Get tags from html
*/
function getTagDataFromHtml( html ) {  
  var tagData = {};
  
  try {
    var separator = ' : ';
    var wantedTags = ['prixmin', 'prixmax', 'anneemin', 'anneemax', 'subcat', 'cat', 'region', 'departement', 'kmmin', 'kmmax', 'cp', 'city'];
    
    for (var i = 0; i < wantedTags.length; i++ ) {
      var tagLabel = wantedTags[i];
      var tagValue = extractHtml(html, tagLabel, ',', tagLabel.length + separator.length);
      
      if (tagValue) {
        tagData[tagLabel] = tagValue;
      }
    }
  } catch (e) {
    console.error("Parsing error:", e); 
  }
    
  return tagData;
}


function getIdFromUrl(url) {
 
  var regex = /\/(\d+)[\.\/\?]/i;
  var matches = url.match(regex);
  var id = matches ? matches[1] : matches;
  
  return id;
}

function getRelativeUrl(url) {
  
  var regex = /(.+leboncoin\.fr)(.+)/i;
  var matches = url.match(regex);
  var relativeUrl = matches ? matches[2] : url;

  return relativeUrl;
}
  

function getListingAdsFromJSON( ads, userLabel ) {  
  
  return ads.map( function( ad ) {
    
    
    
    return {
      id: ad.list_id,
      title: ad.subject,
      textPrice: ad.price && ad.price.length ? formatPrice( ad.price[0] ) + ' €' : '',
      price: ad.price && ad.price.length ? ad.price[0] : undefined,
      userLabel: userLabel,
      textPlace: ad.location.city_label,
      textDateTime: dayjs( ad.index_date ).format('dddd DD MMMM, HH:hh'),
      isPro: ad.owner.type == "pro" ? true : false,
      url: ad.url,
      img: {
      src: ad.images && ad.images.urls && ad.images.urls.length ? ad.images.urls[0] : undefined
      },
      //timestamp: getDateWithIdMilliseconds(new Date(ad.index_date), ad.list_id).getTime(),
      timestamp: getDateObjectFromString( ad.index_date ).getTime(),
      shortUrl: ad.url,
      isDuplicateOf: []
    }
  });

}


/**
  * Get listing ads data
  * @returns {Object} Returns data of the listing ads
*/
function getListingAdsFromHtml( mainHtml, tagsHtml, userLabel ) {  
  
  var ads = [];
  var protocol = 'https:';

  var $selector = getMainJSDOM( mainHtml );
  
  //var tags = getTagDataFromHtml( tagsHtml );
  //var searchCategorySlug = JSON.parse( tags.subcat );
  
  // liste des annonces
  $selector.each(function(i, element) {
    
    var $this = $(this);
    
    var $a = $this.find('a');
    var $item_supp = $this.find('.item_supp');
    
    var $title = $this.find('[itemprop="name"]') || $this.find('.item_title');
    var $price = $this.find('[itemprop="price"]') || $this.find('.item_price');
    var $category = $this.find('[itemprop="category"]') || $item_supp.eq( 0 ); 
    var $place = $this.find('[itemprop="availableAtOrFrom"]') || $item_supp.eq( 1 ); 
    var $img =  $this.find('.item_image').find('.lazyload') || $this.find('[itemprop="image"]');
    var $date = $this.find('[itemprop="availabilityStarts"]') || $item_supp.eq( 2 );
    var isPro = $this.find('.ispro').length ? true : false;
    
    //var categorySlug = (searchCategorySlug == "toutes_categories") ? slug( $category.attr('content') ) : searchCategorySlug;
                
    var ad = {
      //id: Number($a.data( 'info' ).ad_listid),
      id: Number( getIdFromUrl($a.attr('href')) ),
      title: cleanText( $title.text() ),
      textPrice: Number( parseFloat( $price.text().replace(/\s/g, '') ) ).toLocaleString() + ' €',
      price: Number( parseFloat( $price.text().replace(/\s/g, '') ) ),
      //categorySlug: categorySlug,
      userLabel: userLabel,
      textPlace: cleanText( $place.text() ),
      textDateTime: cleanText( $date.text() ),
      textDate: String( $date.attr('content') ),
      isPro: isPro,
      url: 'https://www.leboncoin.fr' + getRelativeUrl( $a.attr('href') ),
      img: {
        src: addProtocol( $img.data('imgsrc') ) || $img.attr('content')
      }
    };
                 
    // A real Date Object with milliseconds based on Ad Id to prevent conflicts
    ad.timestamp = getAdDateTime( ad.textDateTime, ad.id ).getTime();
  
    ad.shortUrl = 'https://leboncoin.fr/vi/' + ad.id;
    ad.isDuplicateOf = []; // for later use
        
    ads.push(ad);
    
  });
    
  return ads;
}


/**
  * Get data before Id
*/
function getAdsBeforeId(ads, stopId) {
  
  var reducedAds = [];
  
  var stopIndex = ads.map(function(ad) {
    return ad.id; 
  }).indexOf(stopId);
  
  reducedAds = ads.slice( 0, stopIndex );

  return reducedAds;
}


/**
  * Get Ads before time
*/
function getAdsBeforeTime(ads, lastTime) {
  
  var reducedAds = [];
  
  ads.map(function(ad) {
    
    if (ad.timestamp > lastTime) {
      reducedAds.push( ad );
    }
  });

  return reducedAds;
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
      //log('TIMESTAMP');
      latestAds = getAdsBeforeTime(ads, latestAdStoredTimestamp);
      
    } else if( Number(latestAdValue) !== 0 ) {
      //log('ID');
      latestAds = getAdsBeforeId(ads, Number(latestAdValue) ); // deprecated, replaced by getDataBeforeTime
      
    } else {
      //log('ALL');
      latestAds = ads;
    }
  }
  
  var latestAdsSorted = latestAds.sort( dynamicSort("-timestamp") );
  
  return latestAdsSorted;
}


/**
  * Filter Ads
*/
function filterAds(ads, singleParams) {
  
  var filteredAds = ads;
    
  if (singleParams.minPrice || singleParams.maxPrice) {
    var minPrice = singleParams.minPrice || undefined;
    var maxPrice = singleParams.maxPrice || undefined;
    
    filteredAds = getAdsBetweenPrice(ads, minPrice, maxPrice)
  }
  
  return filteredAds;
  
}


/**
  * Get Ads between price
*/
function getAdsBetweenPrice(ads, minPrice, maxPrice) {
 
  var filteredAds = [];
      
  ads.map(function(ad) {
        
    if ( ad.price && ((minPrice && ad.price < minPrice) || (maxPrice && ad.price > maxPrice) )) {
      // sorry ad !
    } else {
      filteredAds.push( ad );
    }
    
  });

  return filteredAds;
}


/**
  * Get Ad Date Time (with adId param to generate milliseconds)
*/
var getAdDateTime = function(adTextDateTime, adId) {
  
  // Date is now
  var d = new Date();
  // Reset seconds and milliseconds because of Ad Id magic trick
  d.setSeconds(0);
  d.setMilliseconds(0);
  
  /*var dateSplit = adTextDate.split('-');
  var year = Number(dateSplit[0]);
  var month = Number(dateSplit[1]) - 1; // because months = 0-11
  var day = Number(dateSplit[2]);*/
  
  var dateTimeSeparator = adTextDateTime.indexOf(',');
  var dateString = adTextDateTime.substring(0, dateTimeSeparator).trim().toLowerCase();
  var timeString = adTextDateTime.substring(dateTimeSeparator + 1).trim();
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
  
  //d.setYear( year ); // TODO: find a way to prevent year changes (december->january)
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

function getDateWithIdMilliseconds(date, adId) {
  
  var d = new Date(date);
  var milliseconds = getMillisecondsByMagic( adId );
  d.setMilliseconds( milliseconds )
  
  return d;
  
}


/**
  * Get month number
  * DEPRECATED since leboncoin use microdata for date
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




