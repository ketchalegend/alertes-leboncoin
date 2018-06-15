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
  * Remove duplicate results
*/
Array.prototype.uniq = function uniq() {
  return this.reduce(function(accum, cur) { 
    if (accum.indexOf(cur) === -1) accum.push(cur); 
    return accum; 
  }, [] );
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
    var href = url ? url : "";
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
  * Slug
*/
var slug = function(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to   = "aaaaaeeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '_') // collapse whitespace and replace by -
    .replace(/-+/g, '_'); // collapse dashes

  return str;
};


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


/**
  * Get duplicates
*/
function getDuplicates(arr) {
  var len=arr.length,
      out=[],
      counts={};

  for (var i=0;i<len;i++) {
    var item = arr[i];
    counts[item] = counts[item] >= 1 ? counts[item] + 1 : 1;
    if (counts[item] === 2) {
      out.push(item);
    }
  }

  return out;
}


/**
  *
*/
function runtimeCountStop(start) {

  var stop = new Date();
  var runtime = Number(stop) - Number(start);
  
  return runtime;

}

function getDateObjectFromString(string) {
  
  var compatibleString = string.replace(' ', 'T');
  var date = new Date(compatibleString);
  
  return date;
  
}

function formatPrice(price_value){
    var formatted_price = '';
    var price = ''+price_value;
    var price_length = price.length;
    var start;
    while(price_length > 0){
        start = price_length - 3 > 0 ? price_length - 3 : 0;
        formatted_price = ' ' + price.substring(start, start+3)+formatted_price;
        price = price.substring(0, start);
        price_length = price.length;
    }
    formatted_price = formatted_price.replace(/^\s+/, '');
    return formatted_price;
}