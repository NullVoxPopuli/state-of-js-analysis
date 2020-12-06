"use strict";

const legacyFs = require("fs");
const fs = legacyFs.promises;
const path = require("path");
const ndjson = require("iterable-ndjson");

const aggregatePath = path.join(__dirname, "stats.json");

let dataByYear = {};

const TOOLS = ["ember", "angular", "nextjs", "vuejs", "svelte", "react"];

const INITIAL_DATA_FOR_TOOL = Object.freeze({
  answered: 0,
  unanswered: 0,
  interested: 0,
  not_interested: 0,
  would_use: 0,
  would_not_use: 0,
  never_heard: 0,
});

const INITIAL_DATA_FOR_YEAR = Object.freeze({
  incompleteEntries: 0,
});

// https://share.getcloudapp.com/NQuKg4le
async function main() {
  await ensureData();

  console.log(dataByYear);
}

main();
/**
 * ----------------------------------
 * ----------------------------------
 */
async function ensureData() {
  if (!(await dataAlreadyParsed())) {
    let files = await getFiles();

    await extractData(files);
    await writeData();
  }
}

async function dataAlreadyParsed() {
  try {
    await loadData();
    return true;
  } catch {
    return false;
  }
}

async function writeData() {
  await fs.writeFile(aggregatePath, JSON.stringify(dataByYear));
}

async function loadData() {
  let buffer = await fs.readFile(aggregatePath);

  dataByYear = JSON.parse(buffer.toString());
}

async function extractData(files) {
  for (let file of files) {
    await getData(file);
  }
}

async function getData(file) {
  const source = legacyFs.createReadStream(file);

  for await (const obj of ndjson.parse(source)) {
    let { year, tools } = obj;

    dataByYear[year] = dataByYear[year] || { ...INITIAL_DATA_FOR_YEAR };

    if (!tools) {
      dataByYear[year].incompleteEntries++;
      continue;
    }

    for (let toolName of TOOLS) {
      let tool = tools[toolName];

      let dataSet = dataByYear[year][toolName];

      if (!dataSet) {
        dataByYear[year][toolName] = { ...INITIAL_DATA_FOR_TOOL };
        dataSet = dataByYear[year][toolName];
      }

      if (!tool) {
        dataSet.unanswered++;
        continue;
      }

      dataSet.answered++;
      dataSet[tools[toolName].experience]++;
    }
  }
}

async function getFiles() {
  let directory = await fs.readdir("./data");

  return directory
    .filter((fileName) => fileName.endsWith(".ndjson"))
    .map((fileName) => path.join(__dirname, "data", fileName));
}

async function downloadData() {
  // kaggle account locked atm... :(
  // let key = requireENV('KAGGLE_KEY');
  // let name = requireENV('KAGGLE_USERNAME');
}

function requireENV(name) {
  if (!(name in process.env)) {
    throw new Error(`env var '${name}' must be set`);
  }

  return process.env[name];
}
