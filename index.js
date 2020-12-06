'use strict';

const fs = require('fs').promises;
const path = require('path');


async function main() {

}

main();
/**
 * ----------------------------------
 * ----------------------------------
 */
async function downloadData() {
  let key = requireENV('KAGGLE_KEY');
  let name = requireENV('KAGGLE_USERNAME');
}

function requireENV(name) {
  if (!(name in process.env)) {
    throw new Error(`env var '${name}' must be set`);
  }

  return process.env[name];
}
