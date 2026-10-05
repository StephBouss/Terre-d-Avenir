import * as migration_20261005_142134_init from './20261005_142134_init';

export const migrations = [
  {
    up: migration_20261005_142134_init.up,
    down: migration_20261005_142134_init.down,
    name: '20261005_142134_init'
  },
];
