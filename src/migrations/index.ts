import * as migration_20261005_142134_init from './20261005_142134_init';
import * as migration_20261005_143324_contenus from './20261005_143324_contenus';
import * as migration_20261006_161958_actualites_brouillons from './20261006_161958_actualites_brouillons';
import * as migration_20261007_002738_diaporama from './20261007_002738_diaporama';

export const migrations = [
  {
    up: migration_20261005_142134_init.up,
    down: migration_20261005_142134_init.down,
    name: '20261005_142134_init',
  },
  {
    up: migration_20261005_143324_contenus.up,
    down: migration_20261005_143324_contenus.down,
    name: '20261005_143324_contenus',
  },
  {
    up: migration_20261006_161958_actualites_brouillons.up,
    down: migration_20261006_161958_actualites_brouillons.down,
    name: '20261006_161958_actualites_brouillons',
  },
  {
    up: migration_20261007_002738_diaporama.up,
    down: migration_20261007_002738_diaporama.down,
    name: '20261007_002738_diaporama'
  },
];
