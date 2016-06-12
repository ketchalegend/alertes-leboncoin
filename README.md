

Alertes leboncoin.fr 4.1.2
=============================

Script d'alertes email leboncoin.fr via Google Docs / Drive

**Prérequis :** *vous devez avoir un compte Google et y être connecté.*

### Installation en 4 étapes
1. Créez une copie de cette feuille de calcul : https://docs.google.com/spreadsheet/ccc?key=1oruKJqdbEjg0z28K83hsqIKbaL2weBMqmA8lG0gYIfw&newcopy  
 
2. Renseignez votre adresse email dans l'onglet *Variables* en bas du document

3. Pour que le script soit executé de manière automatique, vous devez programmer un trigger sur la fonction alertesLeBonCoin().  
(Dans outils > editeur de scripts, puis Ressources > déclencheur du script actuel).  
Il est conseillé de régler le trigger sur "toutes les 2 heures".

4. Pour chaque requête que vous souhaitez effectuer sur leboncoin.fr, copiez simplement son url dans la colonne "url" (une url par ligne). 

5. Vous pouvez faire un test en cliquant sur Alertes LeBonCoin > Lancer manuellement. (à côté du menu outils)


v1.x par http://justdocsit.blogspot.fr  
v4.x par [mlb](http://www.maximelebreton.com)  

Pourquoi ce fork ?
-----------------
* refonte totale du code
* intégration de [cheerio](https://github.com/cheeriojs/cheerio) (jquery, mais côté serveur)
* **mise à jour semi-automatique du code** (`Outils > Editeur de scripts`, puis `Ressources > Bibliothèques` pour choisir la version)
* ajout de paramètres utilisateur
* ajout d'une mini carte pour localiser rapidement l'annonce (`showMap`)
* possibilité de choisir l'envoi des résultats en mails individuels ou en mail groupé (`groupedResults`)

Paramètres utilisateurs
----------------------
Pour indiquer vos propres paramètres, utiliser par la variable `userParams` (dans la feuille de calcul : `Outils > Editeur de scripts`)
exemple :
```
var userParams = {
  showMap: true,
  groupedResults: false
}
```
vous pouvez retrouver les paramètres par défaut par ici : https://github.com/maximelebreton/alertes-leboncoin/blob/master/Code.gs#L9

Comment obtenir la dernière mise à jour ?
--------------------------------------
 Dans la feuille de calcul, aller dans `Outils > Editeur de scripts`, puis `Ressources > Bibliothèques`, choisissez la version la plus récente, puis **cliquez sur Enregistrer**.  
![image](https://cloud.githubusercontent.com/assets/1072425/15991503/01a4fe2e-30b5-11e6-82e4-1da6155d48ae.png)

Changelog
--------
* **4.1.2** : Corrections de bugs, amélioration considérable des performances, données normalisées, et ajout de la possibilité de recevoir des mails individuels
* **4.0** : version initiale du projet (bêta)
