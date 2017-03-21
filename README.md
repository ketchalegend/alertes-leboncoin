
> Chers utilisateurs, si vous avez utilisé une **version inférieure à la 5.2.4** lors du passage entre 2016 à 2017, il est possible que vous ne receviez plus les nouvelles annonces. Je vous invite donc à **faire la mise à jour**, et à **vérifier les dates** indiquées dans votre colonne 'Dernière annonce', car elles pourraient avoir 1 an d'avance !


Alertes leboncoin - 5.2.7 [![GitHub watchers](https://img.shields.io/github/stars/maximelebreton/alertes-leboncoin.svg?style=social&label=Star)](https://github.com/maximelebreton/alertes-leboncoin)
=============================
Recevez par email vos recherches leboncoin.fr (via Google Sheets / App Script)

<div style="float:right;"><img src="https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/main.png"/></div>
_____________________________

Pour commencer
------------------------------------------
**Prérequis :** *vous devez avoir un compte Google et y être connecté.*

1. Créez votre **[copie de la feuille de calcul *Alertes leboncoin*](https://goo.gl/Awjw5f)**  

2. Indiquez votre **email** dans l'onglet  **`Paramètres utilisateur`**, et **lancez manuellement** votre première recherche via le **menu `Alertes LeBonCoin`.**  

3. Pour être averti **automatiquement** des prochains résultats, réglez la **fréquence** à laquelle vous souhaitez être averti via le **menu dans `Planification des alertes`.**

4. Il ne vous reste plus qu'à vous rendre sur le site [leboncoin.fr](https://www.leboncoin.fr) pour **copier le lien** de votre recherche, puis le **coller** dans votre feuille de calcul (colonne `Lien` de l'onglet **`Vos alertes`**).


Wiki
-----

- [Comment obtenir le lien de votre recherche ?](https://github.com/maximelebreton/alertes-leboncoin/wiki/Comment-obtenir-le-lien-de-votre-recherche-%3F)


Vos alertes
----------------------------------
Dans la **feuille** intitulée `Vos alertes`, **chaque ligne correspond à une recherche** :  
> Pour chaque recherche que vous souhaitez effectuer sur [leboncoin.fr](https://www.leboncoin.fr), après avoir **copié** le lien de votre recherche, il vous suffit de le **coller** dans la colonne prévue à cet effet, puis de lui donner un titre.

Les colonnes (avec un exemple) :

Titre | Lien | Dernière annonce | Paramètres avancés
------------ | ------------- | ------------- | -------------  
`Caravane` | `https://www.leboncoin.fr/caravaning/` |  | `{"showMap":true}`
*le titre de votre recherche* (*`obligatoire`*) | *l'url de votre recherche* (*`obligatoire`*) | *indique la date du dernier résultat qui vous a été envoyé par email* (*`automatique`*) | *est un champ qui s'adresse aux utilisateurs avancés* (*`facultatif`*)


Paramètres utilisateur
----------------------

### Méthode simple
Dans la **feuille** intitulée `Paramètres utilisateur`, accessible également via le menu `Alertes LeBonCoin` > `Paramètres utilisateur`.

> *Les paramètres définis via la feuille `Paramètres utilisateur` s'appliquent à toutes les recherches*

Paramètre | Valeur | Description
------------ | -------------  | -------------  
`email` | `mon@email.com` (exemple) | *l'adresse à laquelle sera envoyée les annonces. Possibilité de définir plusieurs destinataires en les séparant par une virgule*
`showMap` | `=true` ou `=false` | *affiche une mini carte* 
`mapZoom` | nombre de `=0` à `=17` | *règle le niveau de zoom de la carte*
`groupedResults` | `=true` ou `=false` | *permet de grouper les résultats dans un seul mail*
  

### Méthode avancée

#### Paramères globaux
> *Les paramètres globaux avancés s'appliquent à toutes les recherches*

Via l'objet `userParams` (dans la feuille de calcul : `Outils > Editeur de scripts`), qui permet de personnaliser la totalité des **[variables de la librairie](https://github.com/maximelebreton/alertes-leboncoin/blob/master/src/Code.js#L10)**  

Exemple :
```
var userParams = {
  startIndex: 2,
  selectors: {
    adItem: '.mainList ul > li'
  },
  onDataResult: function(result, entities) {
    // Custom callback
  }
}
```

  
#### Paramètres individuels

> *Les paramètres individuels avancés s'appliquent uniquement à la recherche concernée*

Via la colonne `Paramètres avancées` en passant un `objet JSON`.  

Exemple : 
```
{"email":"autre@email.com","showMap":true,"mapZoom":9}
```

Paramètre (individuel) | Valeur | Description | Type
------------ | -------------  | -------------  | -------------  
`email` | `"mon@email.com"` (exemple) | *l'adresse à laquelle sera envoyée les annonces. Possibilité de définir plusieurs destinataires en les séparant par une virgule* | `String`
`showMap` | `true` ou `false` | *Affiche une mini carte*  | `Boolean`
`mapZoom` | nombre de `0` à `17` | *Règle le niveau de zoom de la carte* | `Number`
`hourFrequency` | `36` (exemple) | *Permet de modifier individuellement la fréquence des envois d'email (en nombre d'heures). Doit être __supérieur__ au déclencheur principal.* | `Number`
`minPrice` | `150` (exemple) | *Spécifier un prix minimum (>=)* | `Number`
`maxPrice` | `275` (exemple) | *Spécifier un prix maximum (<=)* | `Number`
`sendSms` | `true` ou `false` | *[Experimental] Active l'envoi de Sms (uniquement compatible avec l'api __Free Mobile__ pour le moment)* | `Boolean`
`freeUser` | `"0123456789"` (exemple) | *ID Free Mobile* | `String`
`freePass` | `"xxxxxx"` (exemple) | *Clé d'identification (à générer dans [votre espace Free Mobile](http://www.universfreebox.com/article/26337/Nouveau-Free-Mobile-lance-un-systeme-de-notification-SMS-pour-vos-appareils-connectes))*  | `String`
`pause` | `true` ou `false` | *Mets en pause l'annonce* | `Boolean`


Limitations
---------------
Le **code** du projet *Alertes leboncoin* est libre, mais basé sur le **service** *App Script* associé à votre compte Google.  
Bien que ma solution a l'avantage d'être "gratuite", elle reste totalement dépendante de Google, de sa politique et de ses limitations.  
Il est donc plus que conseillé d'avoir un **usage raisonnable de la solution**, sans quoi vous seriez vite confrontés aux [limitations du service](https://developers.google.com/apps-script/guides/services/quotas#current_limitations) (ce qui ne pénalise que vous).  
Mais plus important, *leboncoin.fr* pourrait détecter et sanctionner ces abus, ce qui pénaliserait cette fois toute la communauté.


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
repris depuis la version `4.0.0` par [mlb](http://www.maximelebreton.com)  

Clé projet de la bilbiothèque : `M9iNq7X9ZWxS_D7pHmMGBb6YoFnfw0_Hk`  
Code de la bibliothèque : [script.google.com/...](https://script.google.com/d/15GE-TW-COB9rfq49nF38GDqytbwpK2HMxLQOzdC1JZMGkUCfLqWoG0T4/edit?usp=drive_web)

_____________________________


[Laisser un commentaire](http://maximelebreton.github.io/alertes-leboncoin/#disqus_thread)
-------------
