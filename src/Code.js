/**
 * @OnlyCurrentDoc
 */

var cheerio = cheeriogasify.require('cheerio');
var $ = cheerio;

var version = "5.2.0";

var defaults = {
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
  dateFormat: {
    human: 'd MMMM, HH:mm',
    iso: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  },
  colors: {
    background: {
      working: '#ECEFF1',
      success: '#DCEDC8'
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
      advancedOptions: 'advancedOptionsRange'
    },
    mail: {
      anchorPrefix: 'part-'
    }
  },
  selectors: {
    adItem: '.mainList ul > li',
    adsContext: '#listingAds',
    mainStartTag: '<main id="main"', // the tag is intentionnaly not closed
    mainEndTag: '</main>'
  },
  freeUser: undefined,
  freePass: undefined
};

var normalizedData = {
  result: [],
  entities: {},
  update: false,
  sheetUrl: ''
};

// PARAMS global variable
// todo : refactor with https://developers.google.com/apps-script/guides/properties ?
var params;


/**
* Init
*/
function init(userParams) {
  setParams(userParams);
  createMenu();
  checkMainTrigger();
}


/**
  * Start, everything start from here
*/
function start(userParams) {
  
  setParams(userParams);
  
  if ( !isRecipientEmail() ) {
   setActiveSelectionOnEmail();
   showDialog("Oups !", "Merci de remplir le champ <strong><em>email</em></strong>");
   return; 
  }
  
  // For each value in the url range sheet
  forEachCellInRange( params.names.range.url, params.startIndex, function(index) {
    
    var rangeNames = params.names.range;
    var sheetNames = params.names.sheet;
    
    //Logger.log(getSpreadsheetContext().getSheets()[1].getSheetId());
          
    var lastRangeName = params.isAvailable.advancedOptions ? rangeNames.advancedOptions : rangeNames.lastAd;
    var row = getRowByIndex(index, lastRangeName, sheetNames.main);
    
    highlightRow(row);
    
    var url = getCellByIndex( index, rangeNames.url, sheetNames.main ).getValue(); // String URL expected
    
    var html = getUrlContent( url );
    var ads = getListingAdsFromHtml( html );
    

    if (ads.length && params.sendMail == true) {
      
      var stringifiedSingleParams = params.isAvailable.advancedOptions ? getCellByIndex( index, rangeNames.advancedOptions, sheetNames.main ).getValue() : "";
      var singleParams = stringifiedSingleParams.length ? JSON.parse(stringifiedSingleParams) : {};
      
      var lastAdSentDate = getCellByIndex( index, rangeNames.lastAd, sheetNames.main ).getValue(); // Date Object expected
      var unsentAds = getLatestAds(ads, lastAdSentDate);
      
      var adsToSend = filterAds(unsentAds, singleParams); 
            
      if (adsToSend.length) {
        
        var label = getCellByIndex( index, rangeNames.label, sheetNames.main ).getValue(); // String expected
        
        // not ready (experimental)
        //var tags = getTagsFromHtml( html );
        var tags = '';
        
        setNormalizedData(index, label, url, ads, adsToSend, singleParams, tags, lastAdSentDate);
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
  
  var data = normalizedData;
  
  // user custom callback
  if (params.onDataResult) {
    params.onDataResult(data.result, data.entities);
  }
  
  // If results, send email
  // TODO : refactor
  if ( data.result.length && params.sendMail == true ) {
    
    var recipientEmail = getRecipientEmail();
    
    handleSendData( data, recipientEmail, function(error, result) {

      if (error && error.name == 'Exception') {
        getSpreadsheetContext().toast(error.message, 'Alertes LeBonCoin');
      } else {
        
        getSpreadsheetContext().toast("mail envoyé  à " + recipientEmail, 'Alertes LeBonCoin');
        
        if (params.debug !== true) {
          forEachResult( result, data.entities, setLatestAdRangeValue );  
        } 
        
      }  
    });
    
  }
  
  if ( !data.result.length ) {

    getSpreadsheetContext().toast("Aucune annonce à envoyer");
    
  }
    
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
  var adIdRange = getDataSheetContext().getRange( index, getColumnByName( params.names.range.lastAd ) );
  
  adIdRange.setValue( latestAdDate );
  adIdRange.setNumberFormat( params.dateFormat.human );
  adIdRange.setBackground( params.colors.background.success );  
}


/**
  * Check if recipient email is defined
*/
function isRecipientEmail(callbackString) {
  
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