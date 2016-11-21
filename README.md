

Alertes leboncoin - 5.1.5
=============================
Recevez par email vos recherches leboncoin.fr (via Google Sheets / App Script)

<div style="float:right;"><img src="https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/main.png"/></div>
_____________________________

Pour commencer
------------------------------------------
**Prérequis :** *vous devez avoir un compte Google et y être connecté.*

1. Créez votre **[copie de la feuille de calcul *Alertes leboncoin*](https://goo.gl/Awjw5f)**  

2. Indiquez votre **email** dans les **`Paramètres utilisateur`**, et **lancez manuellement** votre première recherche via le **menu `Alertes LeBonCoin`.**  

3. Pour être averti **automatiquement** des prochains résultats, réglez la **fréquence** à laquelle vous souhaitez être averti via le **menu dans `Planification des alertes`.**

Comment ça fonctionne ?
----------------------------------
C'est très simple, dans la **feuille** intitulée `Vos alertes`, **chaque ligne correspond à une recherche** :
* Pour chaque recherche que vous souhaitez effectuer sur [leboncoin.fr](https://www.leboncoin.fr), il suffit simplement d'en **copier/coller le lien** dans la colonne prévue à cet effet.

Les colonnes :

Titre | Lien | Dernière annonce | Options avancées
------------ | ------------- | ------------- | -------------  
`Caravane` | `https://www.leboncoin.fr/caravaning/` |  | `{"showMap":true}`
*le titre de votre recherche* (*`obligatoire`*) | *l'url de votre recherche* (*`obligatoire`*) | *indique la date du dernier résultat qui vous a été envoyé par email* (*`automatique`*) | *est un champ qui s'adresse aux utilisateurs avancés* (*`facultatif`*)


Paramètres utilisateur
----------------------
> *Les paramètres utilisateur s'appliquent à toutes les recherches*

Dans la **feuille** intitulée `Paramètres utilisateur`, acessible également via le menu *Alertes LeBonCoin*.

Paramètre (global) | Valeur | Description
------------ | -------------  | -------------  
`email` | `mon@email.com` (exemple) | *l'adresse à laquelle sera envoyée les annonces. Possibilité de définir plusieurs destinataires en les séparant par une virgule*
`showMap` | `=true` ou `=false` | *affiche une mini carte* 
`mapZoom` | nombre de `=0` à `=17` | *règle le niveau de zoom de la carte*
`groupedResults` | `=true` ou `=false` | *permet de grouper les résultats dans un seul mail*


Paramètres avancés
--------------------

#### Globaux
> *Les paramètres globaux avancés s'appliquent à toutes les recherches*

Via l'objet `userParams` (dans la feuille de calcul : `Outils > Editeur de scripts`), qui permet de personnaliser la totalité des **[variables de la librairie](https://github.com/maximelebreton/alertes-leboncoin/blob/master/Code.gs#L7)**  

Exemple :
```
var userParams = {
  startIndex: 2,
  names: {
    sheet: {
      main: 'Vos alertes'
    }
  },
  selectors: {
    adItem: '.mainList ul > li'
  },
  onDataResult: function(result, entities) {
    // Custom callback
  }
}
```

  
#### Individuels

> *Les paramètres individuels avancés s'appliquent uniquement à la recherche concernée*

Via la colonne `Paramètres avancées` en passant un `objet JSON` stringifié.  

Exemple : 
```
{"email":"autre@email.com","showMap":true,"mapZoom":9}
```

Paramètre (individuel) | Valeur | Description
------------ | -------------  | -------------  
`email` | `mon@email.com` (exemple) | *l'adresse à laquelle sera envoyée les annonces. Possibilité de définir plusieurs destinataires en les séparant par une virgule*
`showMap` | `true` ou `false` | *affiche une mini carte* 
`mapZoom` | nombre de `0` à `17` | *règle le niveau de zoom de la carte*
`sendSms` | `true` ou `false` | *[Experimental] Active l'envoi de Sms (uniquement compatible avec l'api __Free Mobile__ pour le moment)* 
`freeUser` | `0123456789` (exemple) | *Numéro Free Mobile* 
`freePass` | `xxxxxx` (exemple) | *Clé d'identification (à générer dans [votre espace Free Mobile](http://www.universfreebox.com/article/26337/Nouveau-Free-Mobile-lance-un-systeme-de-notification-SMS-pour-vos-appareils-connectes))* 


Obtenir la dernière mise à jour
----------------------------------
Pour mettre à jour la librairie, une fois dans la feuille de calcul, aller dans `Outils > Editeur de scripts`, puis `Ressources > Bibliothèques`, choisissez la version la plus récente, puis **cliquez sur Enregistrer**.  
> *IMPORTANT : La mise à jour de la librairie ne mets pas à jour la feuille de calcul.
Donc si une nouvelle fonctionnalité n'apparait pas alors que vous venez de mettre à jour la librairie, pensez à récupérer la [dernière version de la feuille de calcul](https://goo.gl/Awjw5f).*

<img src="https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/update.gif"/>



Un problème ?
--------------
**Avant de vous inquiéter :**  
1. vérifiez que votre **adresse email est bien renseignée** et qu'elle ne contient pas de caractères spéciaux (oui, même le +...)  
2. vérifiez que votre **[version est bien à jour](#obtenir-la-dernière-mise-à-jour)** (et n'oubliez pas de cliquer sur enregistrer lors du changement)  
3. si ça ne fonctionne toujours pas, et que vous ne savez pas pourquoi, tentez une **[réinstallation complète](#pour-commencer)**  
4. si le problème n'est pas déjà signalé, je vous invite à **[créer une issue](https://github.com/maximelebreton/alertes-leboncoin/issues)**  


Pourquoi cette version, et quelle différence avec les autres ?
-----------------

J'explique les raisons de cette version ici : 
#### > [Vision et évolutions futures](https://github.com/maximelebreton/alertes-leboncoin/issues/2)

**TL DR;**
* refonte totale du code
* intégration de [cheerio](https://github.com/3846masa/cheerio-gasify) (équivalent de jquery côté serveur)
* **mise à jour semi-automatique du code** (`Outils > Editeur de scripts`, puis `Ressources > Bibliothèques` pour choisir la version)
* ajout de paramètres utilisateur
* ajout d'une mini carte pour localiser rapidement l'annonce (`showMap`)
* possibilité de choisir l'envoi des résultats en mails individuels ou en mail groupé (`groupedResults`)
* Markup HTML externalisé dans des fichiers `.html` gérés par [HTML service](https://developers.google.com/apps-script/guides/html/templates)


CHANGELOG
-------------
Le détail des modifications se trouve dans le **[CHANGELOG](https://github.com/maximelebreton/alertes-leboncoin/blob/master/CHANGELOG.md)**

version originale par http://justdocsit.blogspot.fr  
repris depuis la 4.0 par [mlb](http://www.maximelebreton.com)  

Clé projet de la bilbiothèque : `M9iNq7X9ZWxS_D7pHmMGBb6YoFnfw0_Hk`  
Code de la bibliothèque : [script.google.com/...](https://script.google.com/macros/library/versions/d/15GE-TW-COB9rfq49nF38GDqytbwpK2HMxLQOzdC1JZMGkUCfLqWoG0T4)

_____________________________


[Laisser un commentaire](http://maximelebreton.github.io/alertes-leboncoin/#disqus_thread)
-------------
