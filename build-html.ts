

import { promises as fsp } from 'fs';
import { shotsFolder, outFolder, urlToFname, readJson, dataFile } from './fetch-shots';

const replacer = 'REPLACETHISPLEASE';
const outFile = __dirname + "/README.md";

const md_format = `
# pb2020gallery
A gallery showcasing different sites that use the /r/2020policebrutality API

## Gallery

${replacer}
`;

interface Entry {
  url: string;
  description: string;
}

async function main() {
  const files = await fsp.readdir(outFolder);
  const data: Entry[] = await readJson(dataFile);
  
  console.log(files);
  const lines = [];
  for (const entry of data) {
    // [![alt text](https://www.gravatar.com/avatar/… "Let's check Jason S' profile page")](https://meta.stackoverflow.com/users/44330/jason-s)

    const imageUrl = shotsFolder + '/' + urlToFname(entry.url);
    lines.push(`
      <a href="${entry.url}" class="site">
        <div class="description">
          ${entry.description}
        </div>

        <img src="${imageUrl}" />
      </a>
    `);
  }
  
  // await fsp.writeFile(outFile, outText);
  const htmlBase = await fsp.readFile(__dirname + "/index.template.html", 'utf8');
  const outText = htmlBase.replace("REPLACETHISPLEASE", lines.join('\n'));
  await fsp.writeFile(__dirname + "/index.html", outText);
}

if (typeof require !== 'undefined' && require.main === module) {
  main()
    .catch((err) => { console.error("unhandled fail",  __filename, err)})
    .then(() => { console.log("done with", __filename); });
}
