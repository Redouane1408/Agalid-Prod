# Document de vérification des calculs de devis Agalid

## 1. Objet du document

Ce document décrit la logique réellement intégrée dans le projet pour calculer un devis solaire à partir :

- des produits enregistrés en base de données
- des paramètres de calcul configurés par le propriétaire dans l’administration
- des informations remplies par le client dans le formulaire

Il sert de support de vérification métier.

---

## 2. Sources réelles de données

Le calcul du devis repose désormais sur trois sources réelles :

### 2.1 Données client

- consommation mensuelle
- heures d’ensoleillement
- type de toit
- surface
- localisation
- type de client
- présence d’ombrage

### 2.2 Produits de la base de données

Les produits utilisés dans le devis proviennent de la base :

- panneaux solaires
- onduleurs

Les informations utilisées sont :

- prix réel du produit
- puissance technique lue dans `specs`
- catégorie réelle

### 2.3 Paramètres propriétaire

Le propriétaire peut modifier dans l’admin :

- rendement système
- surface par panneau
- puissance panneau par défaut
- coûts d’installation
- coûts de structure
- coûts de câblage
- coûts de protection
- transport
- maintenance
- marge
- taxes
- multiplicateurs par type de toit
- multiplicateurs par type de client
- règles de sélection produit

---

## 3. Sélection réelle des produits

## 3.1 Panneaux

Le système cherche la catégorie panneau à partir du mot-clé administrateur :

- `panelCategoryKeyword`

Ensuite :

- si un `preferredPanelProductId` est défini, ce produit est utilisé
- sinon, selon la stratégie :
  - `lowest_price` : produit le moins cher
  - `best_price_per_power` : meilleur ratio prix / puissance

## 3.2 Onduleurs

Le système cherche la catégorie onduleur à partir du mot-clé administrateur :

- `inverterCategoryKeyword`

Ensuite :

- si un `preferredInverterProductId` est défini, ce produit est utilisé
- sinon, le système cherche en priorité un onduleur compatible avec la puissance demandée
- parmi les produits compatibles, il prend le moins cher

## 3.3 Puissance lue depuis les produits

La puissance d’un produit est lue depuis :

- `specs.power`
- `specs.puissance`
- `specs.watts`
- `specs.w`
- `specs.powerKw`
- `specs.puissanceKw`

Si la valeur est en watts, elle est convertie en kW.

Exemple :

- `550W` devient `0,55 kW`

---

## 4. Paramètres administrateur utilisés

Les champs principaux pilotant le calcul sont :

- `defaultSystemEfficiency`
- `defaultPanelAreaM2`
- `defaultPanelPowerKw`
- `minimumPanelCount`
- `inverterSizingSafetyFactor`
- `installationBaseCostDa`
- `installationCostPerPanelDa`
- `structureCostPerPanelDa`
- `cablingCostPerKwDa`
- `protectionCostDa`
- `transportCostDa`
- `maintenanceCostDa`
- `shadingCostPercent`
- `marginPercent`
- `taxPercent`
- `roofTypeMultipliers`
- `clientTypeMultipliers`

---

## 5. Équations de calcul intégrées

## 5.1 Consommation journalière

`C_j = C_m / 30`

où :

- `C_j` = consommation journalière
- `C_m` = consommation mensuelle

---

## 5.2 Puissance système requise

`P_req = C_j / max(1 ; H_s × PR)`

où :

- `P_req` = puissance système requise en kW
- `H_s` = heures de plein soleil par jour
- `PR` = rendement système administrateur

---

## 5.3 Nombre de panneaux

`N = max(N_min ; ceil(P_req / P_pan))`

où :

- `N` = nombre de panneaux
- `N_min` = minimum administrateur
- `P_pan` = puissance du panneau choisi

---

## 5.4 Puissance installée réelle

`P_inst = N × P_pan`

où :

- `P_inst` = puissance installée réelle

---

## 5.5 Puissance onduleur requise

`P_ond_req = P_inst × F_ond`

où :

- `P_ond_req` = puissance minimale cible de l’onduleur
- `F_ond` = facteur de sécurité onduleur administrateur

---

## 5.6 Coût matériel

### Panneaux

`C_pan = N × Prix_pan`

### Onduleur

`C_ond = 1 × Prix_ond`

### Sous-total matériel

`C_mat = C_pan + C_ond`

---

## 5.7 Coût d’installation brut

Le coût d’installation brut est :

`C_inst_brut = Base_inst + (N × C_inst_pan) + (N × C_struct_pan) + (P_inst × C_cablage_kw) + C_protection + C_transport + C_maintenance_optionnelle`

où :

- `Base_inst` = coût fixe d’installation
- `C_inst_pan` = coût d’installation par panneau
- `C_struct_pan` = coût structure par panneau
- `C_cablage_kw` = coût câblage par kW
- `C_protection` = coût protections
- `C_transport` = coût transport
- `C_maintenance_optionnelle` = maintenance si activée par règle admin

---

## 5.8 Multiplicateur type de toit

`C_inst_toit = C_inst_brut × M_toit`

où :

- `M_toit` = multiplicateur du type de toit

Exemples possibles :

- toit plat = `1,00`
- toit incliné = `1,15`
- toit mixte = `1,10`

---

## 5.9 Multiplicateur type de client

`C_inst_client = C_inst_toit × M_client`

où :

- `M_client` = multiplicateur du type de client

Exemples possibles :

- Particulier = `1,00`
- Entreprise = `1,05`
- Industrie = `1,10`

---

## 5.10 Surcoût ombrage

Si le site contient des zones d’ombre :

`C_ombrage = C_inst_client × (T_ombrage / 100)`

Sinon :

`C_ombrage = 0`

où :

- `T_ombrage` = pourcentage de surcoût ombrage

---

## 5.11 Sous-total installation

`C_inst = C_inst_client + C_ombrage`

---

## 5.12 Sous-total avant marge

`S_avant_marge = C_mat + C_inst`

---

## 5.13 Marge commerciale

`Marge = S_avant_marge × (T_marge / 100)`

où :

- `T_marge` = taux de marge administrateur

---

## 5.14 Taxes

`Taxes = (S_avant_marge + Marge) × (T_taxe / 100)`

où :

- `T_taxe` = taux de taxe administrateur

---

## 5.15 Total final du devis

`Total = C_mat + C_inst + Marge + Taxes`

---

## 5.16 Production annuelle estimée

`Prod_j = P_inst × H_s × PR`

`Prod_a = Prod_j × 365`

où :

- `Prod_j` = production journalière
- `Prod_a` = production annuelle

---

## 5.17 Surface estimée

`Surface = N × S_pan`

où :

- `S_pan` = surface moyenne administrateur par panneau

---

## 6. Exemple de calcul complet

### Hypothèses

- consommation mensuelle = `450 kWh/mois`
- heures de soleil = `5,5 h/jour`
- rendement système = `0,85`
- panneau choisi = `0,55 kW`
- prix panneau = `35 000 DA`
- prix onduleur = `150 000 DA`
- coût fixe installation = `20 000 DA`
- coût installation / panneau = `6 000 DA`
- coût structure / panneau = `4 000 DA`
- coût câblage / kW = `8 000 DA`
- protections = `15 000 DA`
- transport = `10 000 DA`
- maintenance incluse = `0 DA`
- multiplicateur toit = `1,00`
- multiplicateur client = `1,00`
- ombrage = `0 %`
- marge = `12 %`
- taxe = `19 %`

### Étape 1 : consommation journalière

`C_j = 450 / 30 = 15 kWh/jour`

### Étape 2 : puissance requise

`P_req = 15 / (5,5 × 0,85)`

`P_req = 15 / 4,675`

`P_req ≈ 3,21 kW`

### Étape 3 : nombre de panneaux

`N = ceil(3,21 / 0,55) = 6`

### Étape 4 : puissance installée

`P_inst = 6 × 0,55 = 3,30 kWc`

### Étape 5 : coût matériel

`C_pan = 6 × 35 000 = 210 000 DA`

`C_ond = 150 000 DA`

`C_mat = 210 000 + 150 000 = 360 000 DA`

### Étape 6 : coût installation brut

`C_inst_brut = 20 000 + (6 × 6 000) + (6 × 4 000) + (3,30 × 8 000) + 15 000 + 10 000`

`C_inst_brut = 20 000 + 36 000 + 24 000 + 26 400 + 15 000 + 10 000`

`C_inst_brut = 131 400 DA`

### Étape 7 : installation ajustée

`C_inst_client = 131 400 × 1,00 × 1,00 = 131 400 DA`

`C_ombrage = 0`

`C_inst = 131 400 DA`

### Étape 8 : sous-total avant marge

`S_avant_marge = 360 000 + 131 400 = 491 400 DA`

### Étape 9 : marge

`Marge = 491 400 × 12 % = 58 968 DA`

### Étape 10 : taxes

`Taxes = (491 400 + 58 968) × 19 %`

`Taxes = 550 368 × 19 % = 104 570 DA environ`

### Étape 11 : total final

`Total = 360 000 + 131 400 + 58 968 + 104 570`

`Total = 654 938 DA environ`

---

## 7. Ce qui est réel dans la nouvelle logique

- les produits du devis viennent de la base
- leurs prix viennent de la base
- leurs puissances viennent de la base si renseignées
- les coûts d’installation viennent des paramètres admin
- les règles métier viennent des paramètres admin
- les marges viennent des paramètres admin
- les taxes viennent des paramètres admin
- le devis PDF affiche les lignes réelles de calcul

---

## 8. Où modifier les données réelles

### Produits et prix

À modifier dans le catalogue produit :

- panneaux
- onduleurs
- prix
- caractéristiques techniques

### Paramètres propriétaire

À modifier dans le tableau de bord admin :

- coûts d’installation
- marge
- taxes
- multiplicateurs
- mots-clés catégories
- choix produit préféré
- stratégie de sélection

---

## 9. Conclusion

Le devis n’est plus basé sur une logique de démonstration.

La logique intégrée repose désormais sur :

- les produits réels de la base
- les paramètres réels du propriétaire
- les données réelles du formulaire client

Le point métier le plus important à valider avec le propriétaire reste maintenant la qualité des paramètres saisis dans l’admin, car ce sont eux qui pilotent directement le total final.
