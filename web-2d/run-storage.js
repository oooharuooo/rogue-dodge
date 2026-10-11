// Demo reset authorized by the user. Only game progress/checkpoint keys are reset.
const RUN_STORAGE_VERSION='independent-dungeon-v4';
try{if(localStorage.getItem('rogue-run-schema')!==RUN_STORAGE_VERSION){localStorage.removeItem('rogue-lane-main-v1');localStorage.removeItem('rogue-lane-checkpoint-v1');localStorage.setItem('rogue-run-schema',RUN_STORAGE_VERSION);}}catch{}
