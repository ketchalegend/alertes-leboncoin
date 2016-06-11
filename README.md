

Alertes leboncoin.fr 4.0 beta
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

v1.0 par http://justdocsit.blogspot.fr  
v4.0 par [mlb](http://www.maximelebreton.com)  

Qu'apporte cette version 4.0 ?
* refonte totale du code
* intégration de [cheerio](https://github.com/cheeriojs/cheerio) (jquery, mais côté serveur)
* **mise à jour automatique du code**
* ajout d'une mini carte pour localiser rapidement l'annonce

