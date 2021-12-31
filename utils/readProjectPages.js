import fs from 'fs';
import * as cheerio from 'cheerio';

function getPages(projectPath) {
    return fs.readdirSync(projectPath);
}

function getPageContent(page) {
    return fs.readFileSync(page, 'utf8');
}

function getElementsFromPage(page) {
    const content = getPageContent(page)
    const $ = cheerio.load(content.trim());
    return $('.editable').toArray()
}

export { getPages, getElementsFromPage };
