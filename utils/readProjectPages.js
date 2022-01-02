import { readdirSync, readFileSync } from 'fs';
import * as cheerio from 'cheerio';

function getPages(projectPath) {
    return readdirSync(projectPath).filter(file => file.includes('.html'));
}

function getPageContent(page) {
    return readFileSync(page, 'utf8');
}

function getElementsFromPage(page) {
    const content = getPageContent(page)
    const $ = cheerio.load(content.trim());
    return $('.editable').toArray()
}

export { getPages, getElementsFromPage };
