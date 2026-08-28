# Fusion PDF

Application web pour fusionner des fichiers PDF : sélection / glisser-déposer
des fichiers, réorganisation des pages par glisser-déposer, tri automatique
basé sur la détection des noms de fichiers, puis export du PDF fusionné.

Tout se passe **dans le navigateur** (React + [pdf-lib](https://github.com/Hopding/pdf-lib) +
[pdf.js](https://mozilla.github.io/pdf.js/)) : aucun fichier n'est envoyé à un
serveur, et l'application ne nécessite **aucune installation** (pas de droits
admin requis).

## Fonctionnalités

- Sélection de fichiers via bouton ou **glisser-déposer**
- Aperçu miniature de chaque page
- **Réorganisation des pages** par glisser-déposer, page par page
- **Tri automatique** des fichiers selon les numéros/motifs détectés dans
  leur nom (ex. `chapitre-2.pdf` avant `chapitre-10.pdf`)
- Suppression de pages ou de fichiers individuels
- Fusion et téléchargement du PDF final

## Utilisation (sans installation)

Le build produit **un seul fichier `dist/index.html`** autonome (JS, CSS et
le worker PDF.js sont inlinés). Une fois construit, il suffit de distribuer
ce fichier — clé USB, partage réseau, e-mail — et de l'ouvrir avec un
navigateur, sans serveur ni installation.

```bash
npm install
npm run build
# puis ouvrir dist/index.html dans un navigateur
```

## Développement

```bash
npm install
npm run dev      # serveur de développement avec rechargement à chaud
npm run build    # build de production (dist/index.html autonome)
npm run lint      # oxlint
```
