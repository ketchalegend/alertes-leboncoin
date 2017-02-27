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
  labels [datum.index ] = {
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





