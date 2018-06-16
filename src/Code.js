/**
 * @OnlyCurrentDoc
 */

var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;

var version = "5.4.5";

var defaults = {
  debug: false,
  showMap: false,
  mapZoom: 7,
  showTags: false,
  groupedResults: true,
  splitSendByCategory: true,
  startIndex: 2,
  plainText: false,
  sendMail: true,
  maxSmsSendByResult: 3,
  showMailEditLink: true,
  useCache: false,
  cacheTime: 1500, // in seconds
  muteHttpExceptions: true,
  dateFormat: {
    human: 'd MMMM, HH:mm',
    iso: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  },
  colors: {
    background: {
      working: '#ECEFF1',
      success: '#DCEDC8',
      warning: '#FF0000'
    },
    border: {
      working: '#B0BEC5'
    }
  },
  names: {
    sheet: {
      main: 'Vos alertes',
      variables: 'Paramètres utilisateur',
      debug: 'debug'
    },
    range: {
      label: 'labelRange',
      url: 'urlRange',
      lastAd: 'lastAdRange',
      userVarNames: 'userVarNamesRange',
      userVarValues: 'userVarValuesRange',
      advancedOptions: 'advancedOptionsRange',
      advancedMenu: 'advancedMenuRange'
    },
    mail: {
      anchorPrefix: 'part-'
    }
  },
  selectors: {
    adItem: 'li[itemtype="http://schema.org/Offer"]', // old : '.mainList ul > li'
    adsContext: '#listingAds',
    mainStartTag: '<main ', // the tag is intentionnaly not closed
    mainEndTag: '</main>'
  },
  freeUser: undefined,
  freePass: undefined
};

/*var defaults = {
  debug: false,
  showMap: false,
  mapZoom: 7,
  showTags: false,
  groupedResults: true,
  startIndex: 2,
  plainText: false,
  sendMail: true,
  maxSmsSendByResult: 3,
  showMailEditLink: true,
  useCache: false,
  cacheTime: 1500, // in seconds
  muteHttpExceptions: true,
  humanDateFormat: 'd MMMM, HH:mm',
  isoDateFormat: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  workingBackgroundColor: '#ECEFF1',
  successBackgroundColor: '#DCEDC8',
  warningBackgroundColor: '#FF0000',
  workingBorderColor: '#B0BEC5',
  mainSheetName: 'Vos alertes',
  variablesSheetName: 'Paramètres utilisateur',
  debugSheetName: 'debug',
  labelRangeName: 'labelRange',
  urlRangeName: 'urlRange',
  lastAdRangeName: 'lastAdRange',
  userVarKeysRangeName: 'userVarKeysNamesRange',
  userVarValuesRangeName: 'userVarValuesRange',
  advancedOptionsRangeName: 'advancedOptionsRange',
  advancedMenuRangeName: 'advancedMenuRange',
  anchorPrefixMailName: 'part-',
  adItemSelector: 'li[itemtype="http://schema.org/Offer"]', // old : '.mainList ul > li'
  adsContextSelector: '#listingAds',
  mainStartTagSelector: '<main id="main"', // the tag is intentionnaly not closed
  mainEndTagSelector: '</main>',
  freeUser: undefined,
  freePass: undefined
};*/

var normalizedData = {
  result: [],
  entities: {},
  update: false,
  sheetUrl: ''
};

// PARAMS global variable
// todo : refactor with https://developers.google.com/apps-script/guides/properties ?
var params;


/*
a tester :
config = Object.assign({
    title: 'Foo',
    body: 'Bar',
    buttonText: 'Baz',
    cancellable: true
  }, config);*/

/**
* Init
*/
function init(userParams, e) {
  
  params = getParams(defaults, userParams); 
  
  
  
  createMenu();
  
  //checkCheck();
  /**/
  
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  status = authInfo.getAuthorizationStatus();
  url = authInfo.getAuthorizationUrl();

    //checkMainTrigger();

}

function getParam( param ) {
  return JSON.parse( PropertiesService.getDocumentProperties().getProperty( param ) );
}

function checkCheck() {  
  
  var sheet = getSheetByName( getParam('names').sheet.main );
  var range = getRangeByName( getParam('names').range.advancedMenu );
  var col = range.getColumn();
  
  
  var row = getFirstEmptyRow( getRangeByName( getParam('names').range.url ) );
  
  var cell = sheet.getRange( 2, col, row-1);
  
  cell.clear();
  
  var rule = SpreadsheetApp.newDataValidation()
  .requireValueInList(['Modifier les paramètres avancés'], true)
  .setAllowInvalid(true)
  .setHelpText('')
  .build();
  
  cell.setDataValidation(rule);
  
}

function getFirstEmptyRow( range ) {
  
  var values = range.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct][0] != "" ) {
    ct++;
  }
  return (ct);
}

/**
  * Start, everything start from here
*/
function start(userParams) {
  
   // Start counting execution time
   var runtimeCountStart = new Date();
  
  //setParams(userParams);
  //params = params || getParams(defaults, userParams); 
  getParams(defaults, userParams);
  
  if ( !isRecipientEmail(  ) ) {
   setActiveSelectionOnEmail();
   showDialog("Oups !", "Merci de remplir le champ <strong><em>email</em></strong>");
   return; 
  }
 
  var labelRangeValues = getSpreadsheetContext().getRangeByName( getParam('names').range.label ).getValues();
  var urlRangeValues = getSpreadsheetContext().getRangeByName( getParam('names').range.url ).getValues();
  var lastAdRangeValues = getSpreadsheetContext().getRangeByName( getParam('names').range.lastAd ).getValues();
  var advancedOptionsRangeValues = getSpreadsheetContext().getRangeByName( getParam('names').range.advancedOptions ).getValues();
  
  // For each value in the url range sheet
  forEachValue( urlRangeValues, getParam('startIndex'), function(index) {
    
    var rangeNames = getParam('names').range;
    var sheetNames = getParam('names').sheet;
    
    var arrayIndex = getArrayIndex(index, getParam('startIndex') ); // Because sheet index and array index aren't the same
    
    var lastRangeName = getParam('isAvailable').advancedOptions ? rangeNames.advancedOptions : rangeNames.lastAd;
    var row = getRowByIndex(index, lastRangeName, sheetNames.main);
    
    highlightRow(row);

    var label = labelRangeValues[arrayIndex][0]; // String expected    
    var url = urlRangeValues[arrayIndex][0]; // String URL expected
    //var category = getCategoryFromHtml();
    var htmlContent = getHtmlContentFromUrl( url );    
    
    var ads;
    
    if (htmlContent.json.length) {
      var parsed = JSON.parse( htmlContent.json )
      var JSONAds = parsed.adSearch.data.ads;
      ads = getListingAdsFromJSON( JSONAds, label )
      
    } else {
      ads = getListingAdsFromHtml( htmlContent.main, htmlContent.tags, label );
    }

    
    var stringifiedSingleParams = getParam('isAvailable').advancedOptions ? advancedOptionsRangeValues[arrayIndex][0] : "";
    var singleParams = stringifiedSingleParams.length ? JSON.parse(stringifiedSingleParams) : {};

    if (singleParams.pause !== true && ads.length) {
  
      var lastAdSentDate = lastAdRangeValues[arrayIndex][0]; // Date Object expected
      var unsentAds = getLatestAds(ads, lastAdSentDate);
      var adsToSend = filterAds(unsentAds, singleParams);
      
      getSpreadsheetContext().toast(adsToSend.length + " annonce(s) à envoyer", 'Information');
      
      if (adsToSend.length) {
        
        var lastAdToSendDate = adsToSend[0].timestamp;
        
        // not ready (experimental)
        //var tags = getTagsFromHtml( html );
        
        var datum = {
          index: index,
          label: label,
          url: url,
          adsToSend: adsToSend,
          singleParams: singleParams,
          tags: '',
          lastAdSentDate: lastAdSentDate
          //readyToSend: isItTimeToSend( singleParams )
        }
                
        normalizedData = getNormalizedData( normalizedData, datum );
        
      }
    }
    
    unhighlightRow(row);

  });
  
  
  var update = checkForUpdates();
  if ( update ) {
    normalizedData.update = update;
  }
  
  // sheet url
  normalizedData.sheetUrl = getSpreadsheetContext().getUrl();
  
  
  // Stop counting execution time
  var runtimeInMilliseconds = runtimeCountStop(runtimeCountStart);
  var runtimeInSeconds = (runtimeInMilliseconds / 1000) % 60;
  normalizedData.runtimeInSeconds = runtimeInSeconds.toFixed(2);
  //getSpreadsheetContext().toast("Temps d'execution : " + runtimeInSeconds + " secondes", 'Information');
  
    
  // user custom callback
  if ( getParam('onDataResult') ) {
    //getParam('onDataResult')(normalizedData.result, normalizedData.entities);
  }
  
  //normalizedData.result.length
  var saveResult = [];
  
  if ( normalizedData.result.length ) {
    
    var data = getEnhancedData( normalizedData ); // yep
        
    handleSendData( normalizedData, function(error, callbackRecipient, callbackData, callbackResult) {
            
      if (error) {
        if (error.name == 'Exception') {
          getSpreadsheetContext().toast("Erreur lors de l'envoi à " + callbackRecipient, 'Alertes LeBonCoin');
          Logger.log( error.message );
        }
      } else {
        getSpreadsheetContext().toast("Annonces envoyées  à " + callbackRecipient, 'Alertes LeBonCoin');
        
        // because it needs to be based on ads and not searches
        callbackResult.map( function( id ) {

          var adsSent = callbackData.entities.ads[ id ].toSend;          
          adsSent.map( function( ad ) {
            
            if ( saveResult.indexOf( ad.sheetIndex ) > -1 ) {
              // ok nothing to do                
            } else {
              saveResult.push( ad.sheetIndex );
            }
            
          })
        })
                  
      }  
    });   
    
    if ( getParam('keepHistory') !== false ) {
      //forEachResult( saveResult, dataOk.entities, setLatestAdRangeValue );
      onDataSend( saveResult, normalizedData.entities ); // faster, but buggy display...
    }
    
  }
  
  
  if ( !normalizedData.result.length ) {
    //getSpreadsheetContext().toast("Aucune annonce à envoyer");  
  }
    
}

/**
  * For each result
*/
function onDataSend( result, entities ) {
  
  var lastAdValues = getSpreadsheetContext().getRangeByName( getParam('names').range.lastAd ).getValues();
  var lastAdRange = getDataSheetContext().getRange( 1, getColumnByName( getParam('names').range.lastAd ), lastAdValues.length, 1 );

  var numberFormats = lastAdRange.getNumberFormats();
  var backgroundColors = lastAdRange.getBackgrounds();
  
  result.map( function( id ) {
    var sheetIndex = id;
    var arrayIndex = sheetIndex - 1; // because 1 is 0 in array's
    var lastAd = entities.ads[ sheetIndex ].toSend[0];
    
    if (lastAd) {
      lastAdValues[arrayIndex] = [ new Date( lastAd.timestamp ) ];
      numberFormats[arrayIndex] = [ getParam('dateFormat').human];
      backgroundColors[arrayIndex] = [ getParam('colors').background.success ];
    }
  })
  
  lastAdRange.setValues( lastAdValues );
  lastAdRange.setNumberFormats( numberFormats );
  lastAdRange.setBackgrounds( backgroundColors );
}


/**
  * For each result
*/
function forEachResult( result, entities, callback ) {
  
  for (var i = 0; i < result.length; i++ ) {
    var index = result[i];
    
    if (callback && typeof(callback) === "function") {
      callback(index, entities);
    }
    
  }
}


/**
  * Set latest Ad value
*/
function setLatestAdRangeValue(index, entities) {
  
  var latestAdDate = new Date( entities.ads[index].toSend[0].timestamp );
  var latestAdRange = getDataSheetContext().getRange( index, getColumnByName( getParam('names').range.lastAd ) );
  
  latestAdRange.setValue( latestAdDate );
  latestAdRange.setNumberFormat( getParam('dateFormat').human );
  latestAdRange.setBackground( getParam('colors').background.success );  
}


/**
  * Check if recipient email is defined
*/
function isRecipientEmail( callbackString ) {
  
  var email = getRecipientEmail();

  if (!email.length) {
    return false; 
  }
  
  return true;
}


/**
  * Check for updates
*/
function checkForUpdates() {
  
  var update = false;
  var url = "https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/version.json";
  
  try {
    var response = UrlFetchApp.fetch(url);
    var data = JSON.parse(response.getContentText());

    if ( versionCompare( data.version, version ) == 1) {
      
      update = data;
    }
  } catch(e) {
    // handle error
  }
    
  return update;
}
