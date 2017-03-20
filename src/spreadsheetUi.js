
/**
  * --------------------- *
  *  ABOUT SPREADSHEET UI
  * --------------------- *
*/


/**
  * Create menu
*/
function createMenu() {
  var ui = SpreadsheetApp.getUi();

  // We need to set a local "handle" to call a library function
  ui.createMenu('Alertes LeBonCoin')
      //.addItem('Modifier email destinataire', 'handleUpdateRecipientEmail')
      .addItem('Paramètres utilisateur', 'handleOpenVariablesSheet')
      .addItem('Planification des alertes', 'handleShowMainTriggerWizard')
      .addSeparator()
      .addItem('Lancer manuellement', 'alertesLeBonCoin')
      .addToUi();
}


/**
  * On open variables sheet
*/
function openVariablesSheet(userParams) {
 setParams(userParams);
 SpreadsheetApp.setActiveSheet(getVariablesSheetContext()); 
}


/**
  * Get main trigger wizard template
*/
function getMainTriggerWizardTemplate(callbackString) {
  
  var template = HtmlService.createTemplateFromFile('mainTriggerWizard.tpl');
      template.callbackString = callbackString;
  
  return template.evaluate();
}


/**
  * Show main trigger wizard
*/
function showMainTriggerWizard(callbackString) {
  
  var ui = SpreadsheetApp.getUi();
  
  var html = getMainTriggerWizardTemplate(callbackString).setWidth(360).setHeight(120);
  var response = ui.showModelessDialog(html, "Voulez-vous planifier l'envoi des alertes ?");
}


/**
  * Show simple dialol
*/
function showDialog(title, content) {
 var htmlOutput = HtmlService
 .createHtmlOutput('<div style="font: 13px/18px arial, sans-serif;">' + content + '</div>')
     .setWidth(250)
     .setHeight(80);
  SpreadsheetApp.getUi().showModelessDialog(htmlOutput, title); 
}


/**
  * Highlight row
*/
function highlightRow(row, backgroundColor, borderColor) {
  var backgroundColor = backgroundColor || params.colors.background.working; 
  var borderColor = borderColor || params.colors.border.working; 
  row.setBackground( backgroundColor );
  row.setBorder(true, true, true, true, false, false, borderColor, null);
  SpreadsheetApp.flush(); // see https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#flush
}


/**
  * Unhighlight row
*/
function unhighlightRow(row) {
  row.setBackground('');
  row.setBorder(false, false, false, false, false, false);
  SpreadsheetApp.flush();
}


/**
  * Set active selection on email
*/
function setActiveSelectionOnEmail() {
  SpreadsheetApp.setActiveSheet(getVariablesSheetContext());
  getVariablesSheetContext().setActiveSelection( getRecipientEmailCell() );
}

/**
  * Get recipient email range
*/
function getRecipientEmailCell() {
  var cell = getCellByIndex(2, params.names.range.userVarValues, params.names.sheet.variables);
  //var range = getVariablesSheetContext().getRange( 2, getColumnByName( params.names.range.userVarValues ) );
  return cell;
}


