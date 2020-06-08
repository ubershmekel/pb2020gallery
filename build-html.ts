

import { promises as fsp } from 'fs';
import { shotsFolder, outBaseFolder, urlToFname, readJson, dataFile, srcFolder } from './fetch-shots';

const htmlTemplateFile = srcFolder + "/index.template.html";
const outHtmlFile = outBaseFolder + "/index.html";
const replacer = 'REPLACETHISPLEASE';

interface Entry {
  url: string;
  description: string;
}

async function main() {
  const data: Entry[] = await readJson(dataFile);
  
  const lines = [];
  for (const entry of data) {
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
  
  const htmlBase = await fsp.readFile(htmlTemplateFile, 'utf8');
  const outText = htmlBase.replace("REPLACETHISPLEASE", lines.join('\n'));
  await fsp.writeFile(outHtmlFile, outText);
}

if (typeof require !== 'undefined' && require.main === module) {
  main()
    .catch((err) => { console.error("unhandled fail",  __filename, err)})
    .then(() => { console.log("done with", __filename); });
}
