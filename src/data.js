/**
  * ---------------- *
  *  DATA
  * ---------------- *
*/


/**
  * Set normalized data (inspired by redux & normalizr principles)
*/
function getNormalizedData( data, datum ) {
  
  // Push new result
  data.result.push( datum.index );
        
  // Because GAS is not ecmascript 6, we need to use this method to set dynamic object names...
  var obj = {}; obj[ datum.index ] = {};
  var labels = extend({}, obj);
  var urls = extend({}, obj);
  var ads = extend({}, obj);
  var advanced = extend({}, obj);
  
  // Extend Labels
  labels[ datum.index ] = {
    id: datum.index,
    label: datum.label 
  }
  labels = extend({}, data.entities.labels, labels);  
  
  // Extend urls
  urls[ datum.index ] = {
    id: datum.index,
    url: datum.url
  }
  urls = extend({}, data.entities.urls, urls);
  
  // Extend ads
  ads[ datum.index ] = {
    id: datum.index,
    //all: datum.ads,
    toSend: datum.adsToSend,
    tags: datum.tags
  }
  ads = extend({}, data.entities.ads, ads);
  
  // Extend advanced
  advanced[ datum.index ] = {
    id: datum.index,
    params: datum.singleParams,
    lastAdSentDate: datum.lastAdSentDate
  }
  advanced = extend({}, data.entities.advanced, advanced);
  
  // Extend entities
  data.entities = extend({}, data.entities, {
    labels: labels,
    urls: urls,
    ads: ads,
    advanced: advanced
  });
  
  return data;
  
}


/**
  * Get enhanced data
*/
function getEnhancedData( data ) {
  
  var allAds = getAllAdsFromResult( data, data.result );
  var adsIds = getAttrValuesFromAds( allAds, "id");
  var duplicates = getDuplicates( adsIds );
  
  var enhancedData = getDataWithDuplicates( data, duplicates );
  
  return enhancedData;
}


/**
  * Get data with duplicates
*/
function getDataWithDuplicates( data, duplicates ) {
  
  var alreadySeenDuplicates = [];
  
  data.result.map( function( id ) {
    var ads = data.entities.ads[id].toSend;
    ads.map( function( ad ) {
      
      duplicates.map( function( duplicatedId ) {
        
        if (ad.id == duplicatedId) {          
          if ( alreadySeenDuplicates.indexOf( ad.id ) > -1 ) { // if match in array
            ad.haveDuplicateInResult = id;
            data.entities.advanced[id].haveDuplicates = true;
          } else {
            alreadySeenDuplicates.push( ad.id );
          } 
        }
        
      })
    })
  })

  return data;
}


/**
  * Get category sorted data
*/
function getCategorySortedData(data, ads) {
  var categorySortedData = JSON.parse(JSON.stringify(data));;
  categorySortedData.result = [];
  //categorySortedData.resultSource = [];
  categorySortedData.entities.ads = {};
  categorySortedData.entities.labels = {};
  categorySortedData.entities.urls = {}; // not used
  categorySortedData.entities.advanced = {}; // not used
  
  var adProperty = 'userLabel';
  
  var alreadySeenCategorySlugs = [];
  
  ads.map( function( ad ) {
    
    var id;
    //var indexOfCategorySlug = alreadySeenCategorySlugs.indexOf( ad.categorySlug );
    
    //var labelGroup = s.match(/\[(.*?)\]/g);
    
    var regex = /(?:^\[(.*)])?\s?(.*)/;
    var matches = ad[adProperty].match(regex);
    
    var labelGroup = matches[1];
    var label = matches[2];
    
    var categorySlug = labelGroup ? labelGroup : label;
    
    //var indexOfCategorySlug = alreadySeenCategorySlugs.indexOf( ad[adProperty] );
    
    var indexOfCategorySlug = alreadySeenCategorySlugs.indexOf( categorySlug );

    if ( indexOfCategorySlug > -1 ) { // if match in array
      id = indexOfCategorySlug;
    } else {
      id = alreadySeenCategorySlugs.length;
      
      alreadySeenCategorySlugs.push( categorySlug );
      categorySortedData.result.push( id );
      
      categorySortedData.entities.ads[ id ] = {
        id: id,
        toSend: [] 
      };
      categorySortedData.entities.labels[ id ] = {
        id: id,
        label: categorySlug,
        isGroup: true
      };
      
      // Not used but need to be non-empty
      categorySortedData.entities.urls[ id ] = {
        id: id,
        url: ""
      };
      // Not used but need to be non-empty
      categorySortedData.entities.advanced[ id ] = {
        id: id,
        params: {}
      };
    }
    
    categorySortedData.entities.ads[ id ].toSend.push( ad );
  })
  
  categorySortedData.result.map( function ( id ) {
    var sortedAds = categorySortedData.entities.ads[ id ].toSend.sort( dynamicSort("-timestamp") );
    categorySortedData.entities.ads[ id ].toSend = sortedAds;
  })
  
  return categorySortedData;
}


/**
  * Get all ads from result
*/
function getAllAdsFromResult( data, result ) {
  
  var allAds = [];

  result.map( function( id ) {
    var ads = data.entities.ads[id].toSend;
    
    ads.map( function( ad ) {
      ad.sheetIndex = id;
    })
    
    Array.prototype.push.apply(allAds, ads);
  })
  
  return allAds;
}


/**
  * Get Attributes values from ads
*/
function getAttrValuesFromAds( ads, attribute ) {
  
  var values = []; 
  
  ads.map( function( ad ) {
    var value = ad[attribute];
    values.push( value );
  })
  
  return values;  
}




