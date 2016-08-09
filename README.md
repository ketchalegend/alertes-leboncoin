

Alertes leboncoin - 5.0.2
=============================
Recevez par email vos recherches leboncoin.fr (via Google Sheets / App Script)

<div style="float:right;"><img src="https://raw.githubusercontent.com/maximelebreton/alertes-leboncoin/master/main.png"/></div>
_____________________________

Pour commencer
------------------------------------------
**Prérequis :** *vous devez avoir un compte Google et y être connecté.*

1. **Créez [votre copie de la feuille de calcul *Alertes leboncoin*](https://docs.google.com/spreadsheet/ccc?key=1oruKJqdbEjg0z28K83hsqIKbaL2weBMqmA8lG0gYIfw&newcopy)**  

2. **Indiquez votre email dans les *Paramètres utilisateur*, et *lancez manuellement* votre première recherche via le menu *Alertes&nbsp;LeBonCoin*.**  

3. **Pour être averti *automatiquement* des prochains résultats, réglez la *fréquence* à laquelle vous souhaitez être averti via le menu *Planification des alertes*.**

Comment ça fonctionne ?
----------------------------------
C'est très simple, dans la **feuille** intitulée `Vos alertes`, **chaque ligne correspond à une recherche** :
* Pour chaque recherche que vous souhaitez effectuer sur [leboncoin.fr](https://www.leboncoin.fr), il suffit simplement d'en **copier/coller le lien** dans la colonne prévue à cet effet.

Les colonnes :

  | *description* | *remarque*
------------ | -------------  | -------------  
**Lien** | *l'url de votre recherche* | *`obligatoire`*
**Titre** | *le titre à votre recherche* | *` obligatoire`*
**Dernière annonce** | *indique la date du dernier résultat qui vous a été envoyé par email* | *`automatique`*
**Options avancées** | *est un champ qui s'adresse aux utilisateurs avancés* | *`facultatif`*

Paramètres utilisateurs
----------------------
Dans la **feuille** intitulée `Paramètres utilisateurs`, acessible également via le menu *Alertes LeBonCoin*.

colonne paramètre | colonne valeur | description
------------ | -------------  | -------------  
`email` | `mon@email.com` (exemple) | *l'adresse à laquelle sera envoyée les annonces*
`showMap` | `=true` ou `=false` | *affiche une mini carte* 
`mapZoom` | nombre de `=0` à `=17` | *règle le niveau de zoom de la carte*
`showTags` | `=true` ou `=false` | *(experimental) affiche les critères de recherche*
`groupedResults` | `=true` ou `=false` | *permet de grouper les résultats dans un seul mail*


### Paramètres utilisateurs avancés
Pour les utilisateurs avancés, l'objet `userParams` permet de personnaliser la totalité des [variables de la librairie](https://github.com/maximelebreton/alertes-leboncoin/blob/master/Code.gs#L7) (dans la feuille de calcul : `Outils > Editeur de scripts`)  
Exemple :
```
var userParams = {
  startIndex: 2,
  names: {
    sheet: {
      main: 'Vos alertes'
    }
  }
}
```

### Options avancées
Il est possible de spécifier les options `email`, `showMap` et `mapZoom` pour chaque recherche dans la colonne `Options avancées` en passant un `objet JSON` stringifié.  
Exemple : 
```
{"email":"autre@email.com","showMap":true,"mapZoom":9}
```

Obtenir la dernière mise à jour
----------------------------------
 Dans la feuille de calcul, aller dans `Outils > Editeur de scripts`, puis `Ressources > Bibliothèques`, choisissez la version la plus récente, puis **cliquez sur Enregistrer**.  


______________
![image](https://cloud.githubusercontent.com/assets/1072425/16683980/c0f5a8f8-4502-11e6-8bd3-1fd437a57fde.png)
______________
![image](https://cloud.githubusercontent.com/assets/1072425/16684012/e90b0554-4502-11e6-8c2b-64d41a4ce346.png)
______________
![image](https://cloud.githubusercontent.com/assets/1072425/16684050/27f7cdec-4503-11e6-8dff-15b9b76e4c4d.png)
______________




Un problème ?
--------------
**Avant de vous inquiéter :**  
1. vérifiez que votre **adresse email est bien renseignée** et qu'elle ne contient pas de caractères spéciaux (oui, même le +...)  
2. vérifiez que votre **[version est bien à jour](#obtenir-la-dernière-mise-à-jour)** (et n'oubliez pas de cliquer sur enregistrer lors du changement)  
3. si ça ne fonctionne toujours pas, et que vous ne savez pas pourquoi, tentez une **[réinstallation complète](#pour-commencer)**  
4. si le problème n'est pas déjà signalé, je vous invite à **[créer une issue](https://github.com/maximelebreton/alertes-leboncoin/issues)**  


Pourquoi ce fork ?
-----------------

**TL DR;**
* refonte totale du code
* intégration de [cheerio](https://github.com/3846masa/cheerio-gasify) (équivalent de jquery côté serveur)
* **mise à jour semi-automatique du code** (`Outils > Editeur de scripts`, puis `Ressources > Bibliothèques` pour choisir la version)
* ajout de paramètres utilisateur
* ajout d'une mini carte pour localiser rapidement l'annonce (`showMap`)
* possibilité de choisir l'envoi des résultats en mails individuels ou en mail groupé (`groupedResults`)
* Markup HTML externalisé dans des fichiers `.html` gérés par [HTML service](https://developers.google.com/apps-script/guides/html/templates)

#### > [Vision et évolutions futures de la version 4.x ?](https://github.com/maximelebreton/alertes-leboncoin/issues/2)



Changelog
--------
* **5.0.2** Léger refactoring du code
* **5.0.0** :
 * Ajout d'un menu `Planification des alertes` permettant de paramétrer directement le déclencheur
 * Ajout d'une colonne `Options avancées`
 * Possibilité de définir un email par recherche via les `Options avancées`
 * Paramètres utilisateurs à présent modifiables directement dans la feuille de calcul
 * Centralisation des styles CSS de l'email dans inlineStyles.gs
* **4.3.2** : améliorations du comportement de l'email 
* **4.3.1** : email responsive + modifications visuelles
* **4.3.0** :
 * utilisation des [templates](https://developers.google.com/apps-script/guides/html/templates) pour faciliter la maintenance du markup des emails
 * ajout du résumé des annonces dans l'aperçu du mail (mailPreheaderTemplate.html)
 * ajout d'un placeholder lorsqu'aucune photo n'est disponible
* **4.2.1** : 
 * Correction d'un bug lié à l'affichage des cartes [#3](https://github.com/maximelebreton/alertes-leboncoin/issues/3)
 * Ajout d'une fonction de tri pour que le mail envoyé ne contienne que les dernières annonces même lorsque l'on trie par prix.
* **4.2.0** : 
 * Changement de l'algorithme de détection des dernières annonces (anciennement basé sur un id, et remplacé par un timestamp qui est la combinaison de la date et l'id)
 * Améliorations visuelles (la progression est maintenant visible)
 * Ajout d'une notification en bas de mail lorsqu'une mise à jour est disponible
* **4.1.5** : modification du titre des emails envoyés
* **4.1.4** : ajout d'un footer
* **4.1.3** : Correction d'un bug lié aux paramètres utilisateurs qui n'étaient pas correctement étendus (extend VS deepExtend)
* **4.1.2** : Corrections de bugs, amélioration considérable des performances, données normalisées, et ajout de la possibilité de recevoir des mails individuels
* **4.0** : version initiale du projet (bêta)


_____________________________



v1.x par http://justdocsit.blogspot.fr  
v4.x par [mlb](http://www.maximelebreton.com)  

**Clé projet de la bilbiothèque :** `M9iNq7X9ZWxS_D7pHmMGBb6YoFnfw0_Hk`  
**Accéder au code de la bibliothèque:** : https://script.google.com/macros/library/versions/d/15GE-TW-COB9rfq49nF38GDqytbwpK2HMxLQOzdC1JZMGkUCfLqWoG0T4
