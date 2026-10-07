import * as migration_20261005_142134_init from './20261005_142134_init';
import * as migration_20261005_143324_contenus from './20261005_143324_contenus';
import * as migration_20261006_161958_actualites_brouillons from './20261006_161958_actualites_brouillons';
import * as migration_20261007_002738_diaporama from './20261007_002738_diaporama';
import * as migration_20261007_003528_pages_image_entete from './20261007_003528_pages_image_entete';
import * as migration_20261007_004542_medias_champs from './20261007_004542_medias_champs';
import * as migration_20261007_013109_albums from './20261007_013109_albums';
import * as migration_20261007_201535_messages from './20261007_201535_messages';
import * as migration_20261007_201633_reglages_emails from './20261007_201633_reglages_emails';

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
    name: '20261007_002738_diaporama',
  },
  {
    up: migration_20261007_003528_pages_image_entete.up,
    down: migration_20261007_003528_pages_image_entete.down,
    name: '20261007_003528_pages_image_entete',
  },
  {
    up: migration_20261007_004542_medias_champs.up,
    down: migration_20261007_004542_medias_champs.down,
    name: '20261007_004542_medias_champs',
  },
  {
    up: migration_20261007_013109_albums.up,
    down: migration_20261007_013109_albums.down,
    name: '20261007_013109_albums',
  },
  {
    up: migration_20261007_201535_messages.up,
    down: migration_20261007_201535_messages.down,
    name: '20261007_201535_messages',
  },
  {
    up: migration_20261007_201633_reglages_emails.up,
    down: migration_20261007_201633_reglages_emails.down,
    name: '20261007_201633_reglages_emails'
  },
];
