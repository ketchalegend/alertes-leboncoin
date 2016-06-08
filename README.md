

Alertes leboncoin.fr 4.0
========================

Script d'alertes email leboncoin.fr via Google Docs / Drive

**Prérequis :** *vous devez avoir un compte Google et y être connecté.*

### Installation en 4 étapes
1. Créer une copie de cette feuille de calcul : https://docs.google.com/spreadsheet/ccc?key=0Atof5tNmg-CYdC1hVTkybGxOYkFhM0Qxd0tIYldneVE&newcopy  

2. Renseignez votre adresse email dans l'onglet *variables* en bas du document

3. Pour chaque requête que vous souhaitez effectuer sur leboncoin.fr, copiez simplement son url dans la colonne "url" (une url par ligne).  

4. Pour que le script soit executé de manière automatique, vous devez programmer un trigger sur la fonction alerteLeBonCoin().  
(Dans outils > editeur de scripts, puis Ressources > déclencheur du script actuel).  
Il est conseillé de régler le trigger sur "toutes les 2 heures".

5. Vous pouvez faire un test en cliquant sur LBC Alertes > Lancer manuellement. (à côté du menu outils)

v1.0 par http://justdocsit.blogspot.fr  
v4.0 par [mlb](http://www.maximelebreton.com)  

Qu'apporte cette version 4.0 ?
* refonte totale du code basé
* intégration de cheerio (jquery côté serveur)
* mise à jour automatique (si mode développement activé)
