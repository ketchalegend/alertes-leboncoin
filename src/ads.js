/**
  * ------------------ *
  *  ADS
  * ------------------ *
*/

/**
  * Get ads from url
*/
function getAdsFromUrl( url ) {
  
  var ads;
    
  // Cache is only necessary when debugging with large datasets
  if (params.useCache) {
    var cachedUrlContent = getCachedContent( url );
    if ( cachedUrlContent ) {
      ads = JSON.parse( cachedUrlContent );   
    }
  }
  if ( (params.useCache && !cachedUrlContent) || !params.useCache) {
    
    var html = getUrlContent( url );
    ads = getListingAdsFromHtml( html );
  }
  if ( params.useCache && !cachedUrlContent ) {
    setCache( url, JSON.stringify( ads ) );
  }
  
  return ads;
  
}

/**
  * Get listing ads data
  * @returns {Object} Returns data of the listing ads
*/
function getListingAdsFromHtml( html ) {  
  
  var ads = [];
  var protocol = 'https:';
  var mainHtml = extractHtml(html, params.selectors.mainStartTag, params.selectors.mainEndTag, params.selectors.mainStartTag.length );
  var $selector = $(params.selectors.adItem, params.selectors.adContext, mainHtml);
  
  // liste des annonces
  $selector.each(function(i, element) {
    
    var $this = $(this);
    
    var $a = $this.find('a');
    
    var $item_supp = $this.find('.item_supp');
    
    var $title = $this.find('[itemprop="name"]') || $this.find('.item_title');
    var $price = $this.find('.item_price');
    var $place = $this.find('[itemprop="availableAtOrFrom"]') || $item_supp.eq( 1 ); 
    var $img = $this.find('.item_image').find('.lazyload');    
    var $date = $this.find('[itemprop="availabilityStarts"]') || $item_supp.eq( 2 );
    var isPro = $this.find('.ispro').length ? true : false;
        
    var ad = {
      id: Number($a.data( 'info' ).ad_listid),
      title: cleanText( $title.text() ),
      price: Number( $price.attr('content') ),
      textPrice: cleanText( $price.text() ),
      textPlace: cleanText( $place.text() ),
      textDateTime: cleanText( $date.text() ),
      textDate: String( $date.attr('content') ),
      isPro: isPro,
      url: protocol + $a.attr('href'),
      img: {
        src: addProtocol( $img.data('imgsrc') )
      }
      
    };
                     
    // A real Date Object with milliseconds based on Ad Id to prevent conflicts
    ad.timestamp = getAdDateTime( ad.textDate, ad.textDateTime, ad.id ).getTime();
    ad.shortUrl = 'https://leboncoin.fr/vi/' + ad.id;
        
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
var getAdDateTime = function(adTextDate, adTextDateTime, adId) {
  
  // Date is now
  var d = new Date();
  // Reset seconds and milliseconds because of Ad Id magic trick
  d.setSeconds(0);
  d.setMilliseconds(0);
  
  var dateSplit = adTextDate.split('-');
  var year = Number(dateSplit[0]);
  var month = Number(dateSplit[1]) - 1; // because months = 0-11
  var day = Number(dateSplit[2]);
  
  var dateTimeSeparator = adTextDateTime.indexOf(',');
  //var dateString = adTextDateTime.substring(0, dateTimeSeparator).trim().toLowerCase();
  var timeString = adTextDateTime.substring(dateTimeSeparator + 1).trim();
  var timeSeparator = timeString.indexOf(":");
  //var dateSeparator = dateString.indexOf(" ");
  
  /**
    * DEPRECATED since leboncoin use microdata for date
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
  }*/
  
  // Hours, minutes
  var hours = Number(timeString.substring(0, timeSeparator));
  var minutes = Number(timeString.substring(timeSeparator + 1));
  
  // Milliseconds based on Ad Id (magic trick)
  var milliseconds = getMillisecondsByMagic( adId );
  
  d.setYear( year );
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




