/**
  * ----------- *
  * UTILS
  * ----------- *
*/


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
  * Extract html
*/
function extractHtml(html, startTag, endTag, startIndex, endIndex){
  
  var extractedHtml = "";
  var startIndex = startIndex || 0;
  var endIndex = endIndex || 0;
  
  var from = html.indexOf(startTag);
  
  if (from !== -1) {
    var to = html.indexOf(endTag, from);
    
    extractedHtml = html.substring( from + startIndex, to - endIndex);
  }
  
  return extractedHtml;
}


/**
  * Get hour diff (between date objects)
*/
function getHourDiff(date1, date2) {
  return Math.floor(Math.abs(date1 - date2) / 3600000);
}


/**
  * Clean text
*/
function cleanText(value) {
 
  return value.trim().replace(/\s{2,}/g, ' ');
  
}


/**
  * Filter results
*/
function filterResults(a, b) {
  
  var results = a.filter(function(val) {
    return b.indexOf(val) == -1;
  });
  
  return results;
  
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
  * Decode URL
*/
function decodeURL(url) {
  try {
    url = decodeURIComponent(url);
  } catch(e) {
    url = decodeURIComponent( escape(url) );
  }
  return url;
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
 * Get the value of a querystring
 * @param  {String} field The field to get the value of
 * @param  {String} url   The URL to get the value from (optional)
 * @return {String}       The field value
 */
var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};


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


/**
  * Sort object properties
*/
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
  * Convert type
*/
function convertType(value){
    try {
        return (new Function("return " + value + ";"))();
    } catch(e) {
        return value;
    }
};