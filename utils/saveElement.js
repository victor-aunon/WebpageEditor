import * as cheerio from 'cheerio';
import slugify from 'slugify';
import { writeFileSync } from 'fs';
import { dirname } from 'path';

// Models
import Metatag from '../models/Metatag.js';
import Text from '../models/Text.js';
import Image from '../models/Image.js';
import Video from '../models/Video.js';
import Meta from '../models/Metatag.js';
import Page from '../models/Page.js';

// Functions
import { getPageContent } from './readProjectPages.js';

const saveElementToDB = async request => {
    let response;
    switch (request.params.elementType) {
        case 'title':
            response = await saveTitle(request);
            break;
        case 'metatag':
            response = await saveMetatag(request);
            break;
        case 'text':
            response = await saveText(request);
            break;
        case 'image':
            response = await saveImage(request);
            break;
        case 'video':
            response = await saveVideo(request);
            break;

        default:
            break;
    }
    return response;
};

const saveTitle = async data => {
    const title = await Metatag.findByPk(data.params.id);
    const page = await Page.findByPk(title.pageId);
    const newValue = data.body['element-value'];

    let response;

    if (newValue !== title.value) {
        try {
            const count = await Metatag.update(
                {
                    value: newValue,
                    editorId: data.user.id,
                    editions: title.editions + 1,
                },
                { where: { id: title.id } }
            );
            // Get HTML content
            const pageHTML = getPageContent(page.path);
            const $ = cheerio.load(pageHTML);
            // New element to replace the old one
            const titleHTML = `<title class="editable">${newValue}</title>`;
            $('title').replaceWith(titleHTML);
            // Write the new HTML to its file
            writeFileSync(page.path, $.html());

            response = {
                success: `Se actualizó el título`,
            };
        } catch (error) {
            response = { error: error };
        }
    } else {
        response = { info: 'No se modificó ningún atributo.' };
    }

    return response;
};

const saveMetatag = async data => {
    const metatag = await Metatag.findByPk(data.params.id);
    const page = await Page.findByPk(metatag.pageId);
    const newName = slugify(data.body['element-name'], { lower: true });
    const newValue = data.body['element-value'];

    let response;
    try {
        if ((newName !== metatag.name) | (newValue !== metatag.value)) {
            await Metatag.update(
                {
                    name: newName,
                    value: newValue,
                    editorId: data.user.id,
                    editions: metatag.editions + 1,
                },
                { where: { id: metatag.id } }
            );
            // Get HTML content
            const pageHTML = getPageContent(page.path);
            const $ = cheerio.load(pageHTML);
            // New element to replace the old one
            const metaHTML = `<meta name="${newName}" class="editable" content="${newValue}">`;
            $(`meta[name="${metatag.name}"]`).replaceWith(metaHTML);
            // Write the new HTML to its file
            writeFileSync(page.path, $.html());

            response = {
                success: `Se actualizó la metatag ${newName}`,
            };
        } else {
            response = { info: 'No se modificó ningún atributo.' };
        }
    } catch (error) {
        response = { error: error };
    }
    return response;
};

const saveText = async data => {
    const text = await Text.findByPk(data.params.id);
    const page = await Page.findByPk(text.pageId);
    const newName = slugify(data.body['element-name'], { lower: true });
    const newContent = data.body['element-content'];

    let response;
    try {
        if ((newName !== text.name) | (newContent !== text.content)) {
            await Text.update(
                {
                    name: newName,
                    content: newContent,
                    editorId: data.user.id,
                    editions: text.editions + 1,
                },
                { where: { id: text.id } }
            );
            // Get HTML content
            const pageHTML = getPageContent(page.path);
            const $ = cheerio.load(pageHTML);
            // New element to replace the old one
            const currentText = $(`#${text.name}`);
            const textHTML = `<p id="${newName}" class=${currentText.attr(
                'class'
            )}>${newContent}</p>`;
            $(`#${text.name}`).replaceWith(textHTML);
            // Write the new HTML to its file
            writeFileSync(page.path, $.html());

            response = {
                success: `Se actualizó el texto ${newName}`,
            };
        } else {
            response = { info: 'No se modificó ningún atributo.' };
        }
    } catch (error) {
        response = { error: error };
    }
    return response;
};

const saveImage = async data => {
    const image = await Image.findByPk(data.params.id);
    const page = await Page.findByPk(image.pageId);
    const newName = slugify(data.body['element-name'], { lower: true });
    const newAlt = data.body['element-alt'];
    const newWidth = Number(data.body['element-width']);
    const newHeight = Number(data.body['element-height']);

    let response;
    try {
        if (
            (newName !== image.name) |
            (data.files != null) |
            (newAlt !== image.alt) |
            (newWidth !== image.width) |
            (newHeight !== image.width)
        ) {
            let source = image.source;
            if (data.files) {
                const fileName = data.files['element-upload'].name;
                source = fileName;
                // Upload image to server
                data.files['element-upload'].mv(
                    dirname(page.path) + '/img/' + fileName
                );
            }

            await Image.update(
                {
                    name: newName,
                    source,
                    alt: newAlt,
                    width: newWidth,
                    height: newHeight,
                    editorId: data.user.id,
                    editions: image.editions + 1,
                },
                { where: { id: image.id } }
            );
            // Get HTML content
            const pageHTML = getPageContent(page.path);
            const $ = cheerio.load(pageHTML);
            // New element to replace the old one
            const currentImage = $(`#${image.name}`);
            const imageHTML = `<img id="${newName}" class=${currentImage.attr(
                'class'
            )} src="/img/${source}" alt="${newAlt}" width=${newWidth} height=${newHeight} >`;
            $(`#${image.name}`).replaceWith(imageHTML);
            // Write the new HTML to its file
            writeFileSync(page.path, $.html());

            response = {
                success: `Se actualizó la imagen ${newName}`,
            };
        } else {
            response = { info: 'No se modificó ningún atributo.' };
        }
    } catch (error) {
        response = { error: error };
    }
    return response;
};
const saveVideo = async data => {
    const video = await Video.findByPk(data.params.id);
    const page = await Page.findByPk(video.pageId);
    const newName = slugify(data.body['element-name'], { lower: true });
    const newWidth = Number(data.body['element-width']);
    const newHeight = Number(data.body['element-height']);
    const newAutoplay = Boolean(data.body['element-autoplay']) || false;
    const newControls = Boolean(data.body['element-controls']) || false;
    const newLoop = Boolean(data.body['element-loop']) || false;
    const newMuted = Boolean(data.body['element-muted']) || false;
    console.log(data.body)
    console.log(video.autoplay)

    let response;
    try {
        if (
            (newName !== video.name) |
            (data.files != null) |
            (newWidth !== video.width) |
            (newHeight !== video.width) |
            (newAutoplay !== video.autoplay) |
            (newControls !== video.controls) |
            (newLoop !== video.loop) |
            (newMuted !== video.muted)
        ) {
            let source = video.source;
            if (data.files) {
                const fileName = data.files['element-upload'].name;
                source = fileName;
                // Upload video to server
                data.files['element-upload'].mv(
                    dirname(page.path) + '/video/' + fileName
                );
            }

            await Video.update(
                {
                    name: newName,
                    source,
                    width: newWidth,
                    height: newHeight,
                    autoplay: newAutoplay,
                    controls: newControls,
                    loop: newLoop,
                    muted: newMuted,
                    editorId: data.user.id,
                    editions: video.editions + 1,
                },
                { where: { id: video.id } }
            );
            // Get HTML content
            const pageHTML = getPageContent(page.path);
            const $ = cheerio.load(pageHTML);
            // New element to replace the old one
            const currentVideo = $(`#${video.name}`);
            const videoHTML = `<video id="${newName}" class=${currentVideo.attr(
                'class'
            )} src="/video/${source}" width=${newWidth} height=${newHeight} ${
                newAutoplay === true ? 'autoplay' : ''
            } ${newControls === true ? 'controls' : ''} ${
                newLoop === true ? 'loop' : ''
            } ${newMuted === true ? 'muted' : ''}></video>`;
            $(`#${video.name}`).replaceWith(videoHTML);
            // Write the new HTML to its file
            writeFileSync(page.path, $.html());

            response = {
                success: `Se actualizó el video ${newName}`,
            };
        } else {
            response = { info: 'No se modificó ningún atributo.' };
        }
    } catch (error) {
        response = { error: error };
    }
    return response;
};

export { saveElementToDB };
