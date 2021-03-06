# Structure du répertoire du Code Source

Le code source d'Electron est séparé en plusieurs parties, principalement suivant les conventions de séparation de Chromium.

Vous devrez peut-être vous familiariser avec l'[architecture multi-processus de Chromium](http://dev.chromium.org/developers/design-documents/multi-process-architecture) pour mieux comprendre le code source.

## Structure du Code Source

    Electron
    ├── atom/ - Code Source C++.
    |   ├── app/ - Code d'entrée du système.
    |   ├── browser/ - L'interface incluant la fenêtre principale, l'UI, et toutes les
    |   |   principales opérations. Cela permet au moteur de rendu de gérer les pages Web.
    |   |   ├── ui/ - Implementation de l'UI pour différentes plateformes.
    |   |   |   ├── cocoa/ - Code Source spécifique à Cocoa.
    |   |   |   ├── win/ - Code source spécifique pour le GUI Windows.
    |   |   |   └── x/ - Code Source spécifique à X11.
    |   |   ├── api/ - L'implementation des principales API de processus.
    |   |   ├── net/ - Code lié au réseau.
    |   |   ├── mac/ - Code Source Objective-C spécifique à MacOS.
    |   |   └── resources/ - Icônes, fichiers dépendant de la plateforme, etc.
    |   ├── renderer/ - Code qui s'exécute dans le moteur de rendu.
    |   |   └── api/ - L'implementation des API de processus de rendu.
    |   └── common/ - Code utilisé par les processus principal et le moteur de rendu,
    |       comprenant certains fonctions utilitaires et le code pour intégrer la boucle de
    |       message de Node dans la boucle de message de Chromium.
    |       └── api/ - L'implementation d'API communes, et les fondations
    |           des modules intégrés d'Electron.
    ├── chromium_src/ - Code Source copié depuis Chromium.
    ├── default_app/ - La page par default a montrer quand Electron a démarré sans
    |   fournir une application.
    ├── docs/ - Documentations.
    ├── lib/ - Code Source JavaScript.
    |   ├── browser/ - Code d'initialisation du processus principal JavaScript.
    |   |   └── api/ - Implementation de l'API JavaScript.
    |   ├── common/ - Code JavaScript utilisé par les processus principal et le moteur de rendu
    |   |   └── api/ - Implementation de l'API JavaScript.
    |   └── renderer/ - Code d'initialisation du moteur de rendu JavaScript.
    |       └── api/ - Implementation de l'API Javascript.
    ├── spec/ - Tests automatiques.
    ├── electron.gyp - Règles de build d'Electron.
    └── common.gypi - Paramètres spécifiques du compilateur et règles de construction pour d'autres
        composants comme `node` et` breakpad`.
    

## Structure d'autres Dossiers

* **script** - Scripts utilisés à des fins de développement comme le build, le packaging, les tests, etc.
* **tools** - Scripts d'aide utilisés par les fichiers gyp, contrairement au `script`, les scripts mis ici ne devraient jamais être invoqué par les utilisateurs directement.
* **vendor** - Code Source des dependances tierces, nous n'utilisons pas `third_party` comme nom parce qu'on le confondrait avec le même dossier dans le Code Source de Chromium.
* **node_modules** - Modules de Node tiers utilisés pour les builds.
* **out** - Dossier de sortie temporaire de `ninja`.
* **dist** - Dossier temporaire créé par `script/create-dist.py` lors de la création d'une distribution.
* **external_binaries** - Downloaded binaries of third-party frameworks which do not support building with `gyp`.

## Keeping Git Submodules Up to Date

The Electron repository has a few vendored dependencies, found in the [/vendor](https://github.com/electron/electron/tree/master/vendor) directory. Occasionally you might see a message like this when running `git status`:

```sh
$ git status

    modified:   vendor/brightray (new commits)
    modified:   vendor/node (new commits)
```

To update these vendored dependencies, run the following command:

```sh
git submodule update --init --recursive
```

If you find yourself running this command often, you can create an alias for it in your `~/.gitconfig` file:

    [alias]
        su = submodule update --init --recursive