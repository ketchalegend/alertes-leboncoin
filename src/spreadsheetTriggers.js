/**
  * Check main trigger
*/
function checkMainTrigger(callbackString) {
  
 var triggers = ScriptApp.getProjectTriggers();
    
  if (!triggers.length) {
    showMainTriggerWizard(callbackString);
    return false;
  }
  
  return true;
}


/**
  * Set main trigger
*/
function setMainTrigger(hours) {
  
  deleteProjectTriggers();
  
  var triggerHour = 12;
  var triggerMinute = 30;
  var trigger = ScriptApp.newTrigger('alertesLeBonCoin').timeBased().nearMinute(triggerMinute);
  
  if (hours == 0) {
    
    getSpreadsheetContext().toast("Vos alertes ont été mises en pause", 'Alertes LeBonCoin');
    
  } else {
  
    if (hours >= 1 && hours <= 12) {
      trigger = trigger.everyHours(hours);
    }
    if (hours == 24) {
      trigger = trigger.atHour(triggerHour).everyDays(1);
    }
    if (hours == 48) {
      trigger = trigger.atHour(triggerHour).everyDays(2);
    }
    if (hours == 168) {
      trigger = trigger.atHour(triggerHour).everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY);
    }
    
    trigger = trigger.create();
    var triggerId = trigger.getUniqueId();
    
    if (triggerId) {
      getSpreadsheetContext().toast("Vos alertes ont été réglées sur \"toutes les " + hours + " heures\"", 'Alertes LeBonCoin');
    }
    
  }
  
}


/**
  * Delete project triggers
*/
function deleteProjectTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  
    for (var i = 0; i < triggers.length; i++) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
}