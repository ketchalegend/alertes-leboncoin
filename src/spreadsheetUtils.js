/**
  * ------------------------------------- *
  *  ABOUT SPREADSHEET CUSTOM FUNCTIONS
  * ------------------------------------- *
*/


/**
  * Get url content
*/
function getUrlContent(url, remainingAttempts) {
  
  var remainingAttempts = remainingAttempts || 3; // TODO : refactor because in this way the default param can't be 0
  var response = getUrlResponse(url);
  
  if (response.getResponseCode() === 500 && remainingAttempts > 1) { // TODO : refactor, should be > 0
    Utilities.sleep(1000); // Waiting 1 sec and retry
    getUrlContent(url, remainingAttempts-1);
    return;
  }
  
  return response.getContentText("iso-8859-15");
}


/**
  * Get url response
*/
function getUrlResponse(url) {
  
  var response = UrlFetchApp.fetch(url, {muteHttpExceptions: params.muteHttpExceptions});
  
  return response;  
}


/**
  * For each cell in range
*/
function forEachCellInRange(columnName, startIndex, callback) {
   
  var range = getSpreadsheetContext().getRangeByName(columnName).getValues();
  var startIndex = startIndex - 1 || 0;
  
  for (var i = startIndex, length = range.length; i < length; i++) {

    var index = i + 1;
    var value = range[i][0];
    
    if (value.length && callback && typeof(callback) === "function") {
      callback(index);
    }
  }
  
}

/**
  * Get row by index
*/
function getRowByIndex( index, rangeName, sheetName ) {
  
  return getSheetByName( sheetName ).getRange(index, 1, 1, getColumnByName( rangeName ) );
}

/**
  * Get cell by index
*/
function getCellByIndex( index, rangeName, sheetName ) {
  
  return getSheetByName( sheetName ).getRange(index, getColumnByName( rangeName ) );
}


/**
  * Get range by name
*/
function getRangeByName( rangeName ) {
      
  return getSpreadsheetContext().getRangeByName( rangeName );
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
  * Get data sheet context
*/
function getSheetByName(name) {
  var sheet = getSpreadsheetContext().getSheetByName( name );
  
  return sheet;
}

/**
  * Get data sheet context
*/
function getDataSheetContext() {
  var sheet = getSpreadsheetContext().getSheetByName( params.names.sheet.main );
  
  return sheet;
}

/**
  * Get variables sheet context
*/
function getVariablesSheetContext() {
  var sheet = getSpreadsheetContext().getSheetByName( params.names.sheet.variables );
  
  return sheet;
}


/**
  * Get full range name
*/
function getFullRangeName( rangeName ) {
  
  return names.sheet.main + '!' + rangeName;
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