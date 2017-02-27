# Change Log

### 5.2.6
- fix #22

### 5.2.5
- fix #17

### 5.2.4
> Si vous avez utilisé une **version inférieure à la 5.2.4** lors du passage entre 2016 à 2017, il est possible que vous ne receviez plus les nouvelles annonces. Je vous invite donc à **faire la mise à jour**, et à **vérifier les dates** indiquées dans votre colonne 'Dernière annonce', car elles pourraient avoir 1 an d'avance !  

- Correction du bug de l'an 2000 (du même genre en tout cas, les annonces restaient bloquées au 31 décembre)
- correctif [#14](https://github.com/maximelebreton/alertes-leboncoin/issues/14)

### 5.2.3
- Refactoring + correctif [#13](https://github.com/maximelebreton/alertes-leboncoin/issues/13)

### 5.2.2
- Amélioration du footer de notification de mise à jour

### 5.2.1
- Correction d'un bug causé par le refactoring

## 5.2.0 - `30/12/2016`
- Envoi de Sms (numéro Free Mobile uniquement) `sendSms`, `freeUser`, `freePass`
- Possibilité de définir de manière plus fine le prix minimum et maximum `minprice` et `maxprice`
- Possibilité d'ajuster la fréquence des envois de mail de manière individuelle `hourFrequency`
- Pro indiqué entre parenthèses lorsque les résultats ne contiennent que des résultats profesionnels
- Ajout du lien "Éditer mes alertes" en bas de mail (avec la possibilité de le désactiver) `showMailEditLink`
- Refactoring du code, et séparation des fichiers

### 5.1.3
- Ajout du mail en format texte

## 5.1.0 - `15/11/2016`
- possibilité d'exécuter une fonction custom (`onDataResult()`) via les paramètres utilisateurs avancés
- dans la planification d'alertes, ajout des entrées `tous les jours`, `tous les 2 jours`, `toutes les semaines` et `mettre en pause`.
- ajout d'un 'One Click Action' dans Gmail (`Éditer`) pour accéder directement à la feuille de calcul

### 5.0.4
- Les autorisations d'accès sont maintenant limitées au document (par défaut, cela demandait un accès total !)

### 5.0.2
- Léger refactoring du code

## 5.0.0 - `01/08/2016`
- Ajout d'un menu `Planification des alertes` permettant de paramétrer directement le déclencheur
- Ajout d'une colonne `Options avancées`
- Possibilité de définir un email par recherche via les `Options avancées`
- Paramètres utilisateurs à présent modifiables directement dans la feuille de calcul
- Centralisation des styles CSS de l'email dans inlineStyles.gs
- Ajout d'un libellé 'pro' pour les annonces professionelles

### 4.3.2
- améliorations du comportement de l'email 

### 4.3.1
- email responsive + modifications visuelles

## 4.3.0 - `12/07/2016`
- utilisation des [templates](https://developers.google.com/apps-script/guides/html/templates) pour faciliter la maintenance du markup des emails
- ajout du résumé des annonces dans l'aperçu du mail (mailPreheaderTemplate.html)
- ajout d'un placeholder lorsqu'aucune photo n'est disponible

### 4.2.1
 - Correction d'un bug lié à l'affichage des cartes [#3](https://github.com/maximelebreton/alertes-leboncoin/issues/3)
 - Ajout d'une fonction de tri pour que le mail envoyé ne contienne que les dernières annonces même lorsque l'on trie par prix.
 
## 4.2.0 - `04/07/2016`
 - Changement de l'algorithme de détection des dernières annonces (anciennement basé sur un id, et remplacé par un timestamp qui est la combinaison de la date et l'id)
 - Améliorations visuelles (la progression est maintenant visible)
 - Ajout d'une notification en bas de mail lorsqu'une mise à jour est disponible
 
### 4.1.5
- modification du titre des emails envoyés

### 4.1.4
- ajout d'un footer

### 4.1.3
- Correction d'un bug lié aux paramètres utilisateurs qui n'étaient pas correctement étendus (extend VS deepExtend)

### 4.1.2
- Corrections de bugs, amélioration considérable des performances, données normalisées, et ajout de la possibilité de recevoir des mails individuels

## 4.0.0 - `08/06/2016`
- Reprise intégrale du projet par [@maximelebreton](https://github.com/maximelebreton) et refactoring complet selon ces principes : https://github.com/maximelebreton/alertes-leboncoin/issues/2

## 3.x.x - `07/03/2016`
- par [@jief](https://github.com/jief666) : https://github.com/jief666/alertes-leboncoin

## 2.x.x - `22/10/2012`
- http://justdocsit.blogspot.fr/2012/11/alerte-leboncoin-v2.html

## 1.x.x - `09/07/2012`
- version originale par [@St3ph-fr](https://github.com/St3ph-fr) : http://justdocsit.blogspot.fr/2012/07/creer-une-alerte-sur-le-bon-coin.html
