/**
  * --------------------- *
  *  ABOUT PREREQUISITES
  * --------------------- *
*/


/**
  * Set params
*/
function setParams(userScriptParams) {
  
  var scriptParams = deepExtend({}, defaults, handleDepreciatedParams(userScriptParams) );
 
  params = scriptParams; // because getUserParamsFromSheet() need params... (maybe needs to refactor?)
  var sheetParams = getUserParamsFromSheet();
  
  var mergedParams = deepExtend({}, scriptParams, sheetParams)
  params = mergedParams;
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
  
  return modifiedParams;
}


/**
  * Get user params from variables sheet
*/
function getUserParamsFromSheet() {
  
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
  
  if (params.isAvailable.sheetParams) {
    recipientEmail = params.email;
  } else {
    recipientEmail = getValuesByRangeName( params.names.range.recipientEmail )[1][0];
  }
       
  return recipientEmail;
}