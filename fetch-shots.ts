const captureWebsite = require('capture-website');
import { promises as fsp } from 'fs';
import * as fs from 'fs';
const rmfr = require('rmfr');

export const shotsFolder = 'screenshots';
export const outFolder = __dirname + '/' + shotsFolder;
const imagesFilter = outFolder + '/*.png'
export const dataFile = __dirname + '/sites.json';


const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

function linkify(text) {

  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
}

function findAll(reg: RegExp, text: string) {
  const matches = [];
  let found;
  while (found = reg.exec(text)) {
    matches.push(found[0]);
    reg.lastIndex -= found[0].split(':')[1].length;
  }
  return matches;
}

export function urlToFname(url: string) {
  return url.replace(/https?:/g, '').replace(/\//g, '') + '.png';
}

export async function readJson(filePath: string) {
  return JSON.parse(await fsp.readFile(filePath, 'utf8'))
}

function checkFileExists(filepath){
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.constants.F_OK, error => {
      resolve(!error);
    });
  });
}


async function main() {
  // await captureWebsite.file('https://sindresorhus.com', 'screenshot.png');

  // Make sure screenshots directory exists
  if (!await checkFileExists(outFolder)) {
    await fsp.mkdir(outFolder);
  }

  // Delete existing images
  await rmfr(imagesFilter, { glob: true });


  // const text = String(await fsp.readFile('./README.md'));
  const entries = await readJson(dataFile);

  let promises = [];
  // for (const line of text.split('\n')) {
  for (const entry of entries) {
    if (promises.length > 4) {
      // limit parallelism
      await Promise.all(promises);
      promises = [];
    }
    // console.log(line);
    const url = entry.url;
    console.log(url);

    if (url.indexOf('github.com') >= 0) {
      console.log("skipping github.com");
      continue
    }
    const fname = urlToFname(url);
    const dest = `${outFolder}/${fname}`;
    promises.push(captureWebsite.file(url, dest, {
      width: 800,
      height: 1000,
      scaleFactor: 1,
      delay: 2,
    }));
    console.log("promised");
  }
  await Promise.all(promises);
  console.log("done");
};

if (typeof require !== 'undefined' && require.main === module) {
  main()
    .catch((err) => { console.error("unhandled fail", __filename, err) })
    .then(() => { console.log("done with", __filename); });
}
