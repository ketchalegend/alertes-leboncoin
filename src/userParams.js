/**
  * --------------------- *
  *  ABOUT PREREQUISITES
  * --------------------- *
*/


/**
  * Set params
*/
function getParams(defaults, userScriptParams) {
   
  var scriptParams = deepExtend({}, defaults, handleDepreciatedParams(userScriptParams) );
  
  //var params = scriptParams; // because getUserParamsFromSheet() need params... (maybe needs to refactor?)
  var sheetParams = getUserParamsFromSheet( scriptParams );
  
  var mergedParams = deepExtend({}, scriptParams, sheetParams)
  //params = mergedParams;
  
  
  var stringifiedParams = {};
  Object.keys(mergedParams).forEach( function(key) {
    
    var value = JSON.stringify( mergedParams[key], function(key, val) {
      if (typeof val === 'function') {
        return val + ''; // implicitly `toString` it
      }
      return val;
    });
    
    stringifiedParams[key] = value;
  });
  
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperties( stringifiedParams ); 
  
  var names = getParam('names');
  Logger.log( stringifiedParams );
  Logger.log( typeof names );
  Logger.log( names.sheet );
  Logger.log( names['sheet'] );
    
  return mergedParams;
}


/**
  * Handle old versions params
*/
function handleDepreciatedParams(userScriptParams) {
  
  var modifiedParams = userScriptParams || {};
  
  var rangeNames = (((userScriptParams || {}).names || {}).range || {});

  // manage deprecated adIdRange
  var adIdRange = rangeNames.adId
  var lastAdRange = rangeNames.lastAd;
  
  if (typeof adIdRange !== 'undefined' && typeof lastAdRange == 'undefined') {
    modifiedParams.names.range.lastAd = userScriptParams.names.range.adId;
    delete modifiedParams.names.range.adId;
  }
  
  modifiedParams.isAvailable = {};
  
  var userVarNamesRange = rangeNames.userVarNames;
  if (typeof userVarNamesRange == 'undefined') {
    modifiedParams.isAvailable.sheetParams = false;
  } else {
    modifiedParams.isAvailable.sheetParams = true;
  }
  
  var advancedOptionsRange = rangeNames.advancedOptions;
  if (typeof advancedOptionsRange == 'undefined') {
    modifiedParams.isAvailable.advancedOptions = false;
  } else {
    modifiedParams.isAvailable.advancedOptions = true;
  }
  
  var advancedMenuRange = rangeNames.advancedMenu;
  if (typeof advancedMenuRange == 'undefined') {
    modifiedParams.isAvailable.advancedMenu = false;
  } else {
    modifiedParams.isAvailable.advancedMenu = true;
  }
  
  return modifiedParams;
}


/**
  * Get user params from variables sheet
*/
function getUserParamsFromSheet( params ) {
  
  var sheetUserParams = {};
    
  if (params.isAvailable.sheetParams) {
    forEachCellInRange( params.names.range.userVarNames, params.startIndex, function(index) {
      
      var name = getCellByIndex(index, params.names.range.userVarNames, params.names.sheet.variables).getValue();
      var value = getCellByIndex(index, params.names.range.userVarValues, params.names.sheet.variables).getValue();
      
      sheetUserParams[name] = value;
    });
  }
  
  return sheetUserParams;
}


/**
  * Get recipient email
*/
function getRecipientEmail() {
  
  var recipientEmail;
  
  if ( getParam('isAvailable').sheetParams ) {
    recipientEmail = getParam('email');
  } else {
    recipientEmail = getValuesByRangeName( getParam('names').range.recipientEmail )[1][0];
  }
       
  return recipientEmail;
}