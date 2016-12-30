/**
  * ---------------- *
  *  DATA
  * ---------------- *
*/


/**
  * Set normalized data (inspired by redux & normalizr principles)
*/
function setNormalizedData(key, label, url, allAds, adsToSend, singleParams, tags, lastAdSentDate) {
 
  // Push new result
  normalizedData.result.push( key );
        
  // Because GAS is not ecmascript 6, we need to use this method to set dynamic object names...
  var obj = {}; obj[key] = {};
  var labels = extend({}, obj);
  var urls = extend({}, obj);
  var ads = extend({}, obj);
  var advanced = extend({}, obj);
  
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
    all: allAds,
    toSend: adsToSend,
    tags: tags
  }
  ads = extend({}, normalizedData.entities.ads, ads);
  
  // Extend advanced
  advanced[key] = {
    id: key,
    params: singleParams,
    lastAdSentDate: lastAdSentDate
  }
  advanced = extend({}, normalizedData.entities.advanced, advanced);
  
  // Extend entities
  normalizedData.entities = extend({}, normalizedData.entities, {
    labels: labels,
    urls: urls,
    ads: ads,
    advanced: advanced
  });
  
}





