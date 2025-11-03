# Icônes PWA - CheckHagnere

## Génération des icônes

Vous devez créer les icônes suivantes pour que la PWA fonctionne correctement :

### Tailles requises
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Méthodes de génération

### Option 1 : Utiliser un outil en ligne (Recommandé)

**PWA Builder** : https://www.pwabuilder.com/imageGenerator
1. Téléchargez votre logo (minimum 512x512px)
2. Générez toutes les icônes automatiquement
3. Téléchargez et placez dans ce dossier

**RealFaviconGenerator** : https://realfavicongenerator.net/
1. Uploadez votre logo
2. Configurez les options PWA
3. Téléchargez le package

### Option 2 : Avec ImageMagick (CLI)

Si vous avez un logo SVG ou PNG haute résolution :

```bash
# Installer ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Générer toutes les tailles depuis logo-512.png
convert logo-512.png -resize 72x72 icon-72x72.png
convert logo-512.png -resize 96x96 icon-96x96.png
convert logo-512.png -resize 128x128 icon-128x128.png
convert logo-512.png -resize 144x144 icon-144x144.png
convert logo-512.png -resize 152x152 icon-152x152.png
convert logo-512.png -resize 192x192 icon-192x192.png
convert logo-512.png -resize 384x384 icon-384x384.png
convert logo-512.png -resize 512x512 icon-512x512.png
```

### Option 3 : Utiliser le logo existant temporairement

En attendant de créer les vraies icônes, vous pouvez copier votre logo actuel :

```bash
# Depuis le dossier racine du projet
cp public/medias/images/logo-a599f4ae.svg public/medias/icons/icon-192x192.png
# Répétez pour chaque taille
```

## Spécifications de design

### Logo recommandé
- **Format** : PNG avec fond transparent ou couleur unie
- **Taille source** : Minimum 512x512px (idéalement 1024x1024px)
- **Zone de sécurité** : 10% de padding autour du logo
- **Style** : Simple et reconnaissable, même en petit

### Maskable Icon (Android)
Les icônes avec "purpose": "maskable" doivent avoir :
- Le contenu important au centre (80% de la surface)
- 20% de padding de chaque côté
- Couleur de fond unie

## Test

Une fois les icônes créées, testez avec :
1. Chrome DevTools > Application > Manifest
2. Lighthouse > PWA audit
3. Installation réelle sur mobile
