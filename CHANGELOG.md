# Change Log

## 5.2.0 - `30/12/2016`
- Envoi de Sms (numéro Free Mobile uniquement) `sendSms`, `freeUser`, `freePass`
- Possibilité de définir de manière plus fine le prix minimum et maximum `minprice` et `maxprice`
- Possibilité d'ajuster la fréquence des envois de mail de manière individuelle `hourFrequency`
- Pro indiqué entre parenthèses lorsque les résultats ne contiennent que des résultats profesionnels
- Ajout du lien "Éditer mes alertes" en bas de mail (avec la possibilité de le désactiver) `showMailEditLink`
- Refactoring du code, et séparation des fichiers

## 5.1.3 - `17/11/2016`
- Ajout du mail en format texte

## 5.1.0 - `15/11/2016`
- possibilité d'exécuter une fonction custom (`onDataResult()`) via les paramètres utilisateurs avancés
- dans la planification d'alertes, ajout des entrées `tous les jours`, `tous les 2 jours`, `toutes les semaines` et `mettre en pause`.
- ajout d'un 'One Click Action' dans Gmail (`Éditer`) pour accéder directement à la feuille de calcul

## 5.0.4
- Les autorisations d'accès sont maintenant limitées au document (par défaut, cela demandait un accès total !)

## 5.0.2
- Léger refactoring du code

## 5.0.0
- Ajout d'un menu `Planification des alertes` permettant de paramétrer directement le déclencheur
- Ajout d'une colonne `Options avancées`
- Possibilité de définir un email par recherche via les `Options avancées`
- Paramètres utilisateurs à présent modifiables directement dans la feuille de calcul
- Centralisation des styles CSS de l'email dans inlineStyles.gs
- Ajout d'un libellé 'pro' pour les annonces professionelles

## 4.3.2
- améliorations du comportement de l'email 

## 4.3.1
- email responsive + modifications visuelles

## 4.3.0
- utilisation des [templates](https://developers.google.com/apps-script/guides/html/templates) pour faciliter la maintenance du markup des emails
- ajout du résumé des annonces dans l'aperçu du mail (mailPreheaderTemplate.html)
- ajout d'un placeholder lorsqu'aucune photo n'est disponible

## 4.2.1
 - Correction d'un bug lié à l'affichage des cartes [#3](https://github.com/maximelebreton/alertes-leboncoin/issues/3)
 - Ajout d'une fonction de tri pour que le mail envoyé ne contienne que les dernières annonces même lorsque l'on trie par prix.
 
## 4.2.0
 - Changement de l'algorithme de détection des dernières annonces (anciennement basé sur un id, et remplacé par un timestamp qui est la combinaison de la date et l'id)
 - Améliorations visuelles (la progression est maintenant visible)
 - Ajout d'une notification en bas de mail lorsqu'une mise à jour est disponible
 
## 4.1.5
- modification du titre des emails envoyés

## 4.1.4
- ajout d'un footer

## 4.1.3
- Correction d'un bug lié aux paramètres utilisateurs qui n'étaient pas correctement étendus (extend VS deepExtend)

## 4.1.2
- Corrections de bugs, amélioration considérable des performances, données normalisées, et ajout de la possibilité de recevoir des mails individuels

## 4.0.0
- version initiale du projet (bêta)
