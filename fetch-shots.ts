const captureWebsite = require('capture-website');
const fsp = require('fs').promises;
const rmfr = require('rmfr');

export const shotsFolder = 'screenshots';
export const outFolder = __dirname + '/' + shotsFolder;
const imagesFilter = outFolder + '/*.png'


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

async function main() {
  // await captureWebsite.file('https://sindresorhus.com', 'screenshot.png');
  // Delete existing images
  await rmfr(imagesFilter, { glob: true });


  const text = String(await fsp.readFile('./README.md'));
  let promises = [];
  for (const line of text.split('\n')) {
    if (promises.length > 4) {
      // limit parallelism
      await Promise.all(promises);
      promises = [];
    }
    console.log(line);
    if (line.indexOf('://') == -1) {
      console.log('skip no url');
      continue;
    }
    const urls = findAll(urlRegex, line);
    for (const url of urls) {
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
  }
  await Promise.all(promises);
  console.log("done");
};

if (typeof require !== 'undefined' && require.main === module) {
  main()
    .catch((err) => { console.error("unhandled fail", __filename, err) })
    .then(() => { console.log("done with", __filename); });
}
