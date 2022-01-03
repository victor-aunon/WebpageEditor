import User from '../models/User.js';

import Metatag from '../models/Metatag.js';
import Text from '../models/Text.js';
import Image from '../models/Image.js';
import Video from '../models/Video.js';

const ELEMENT_TYPES = {
    title: { name: 'title', model: Metatag },
    meta: { name: 'metatag', model: Metatag },
    p: { name: 'text', model: Text },
    img: { name: 'image', model: Image },
    video: { name: 'video', model: Video },
};

async function getElementPropsByType(currentUserId, pageId, elements, type) {
    const selectedElements = elements.filter(element => element.name === type);
    const selectedProps = [];

    switch (type) {
        case 'title':
            selectedProps.push(
                await elementEditionProps(
                    currentUserId,
                    pageId,
                    Metatag,
                    selectedElements[0],
                    'title',
                    ELEMENT_TYPES[type].name
                )
            );
            return selectedProps;

        case 'meta':
            const metatags = selectedElements.filter(
                meta =>
                    !Object.keys(meta.attribs).includes('charset') &
                    !Object.keys(meta.attribs).includes('http-equiv') &
                    (meta.attribs.name !== 'viewport')
            );
            for (const meta of metatags) {
                selectedProps.push(
                    await elementEditionProps(
                        currentUserId,
                        pageId,
                        Metatag,
                        meta,
                        meta.attribs.name,
                        ELEMENT_TYPES[type].name
                    )
                );
            }
            return selectedProps;

        case 'p':
            for (const p of selectedElements) {
                selectedProps.push(
                    await elementEditionProps(
                        currentUserId,
                        pageId,
                        Text,
                        p,
                        p.attribs.id,
                        ELEMENT_TYPES[type].name
                    )
                );
            }
            return selectedProps;

        case 'img':
            for (const img of selectedElements) {
                selectedProps.push(
                    await elementEditionProps(
                        currentUserId,
                        pageId,
                        Image,
                        img,
                        img.attribs.id,
                        ELEMENT_TYPES[type].name
                    )
                );
            }
            return selectedProps;

        case 'video':
            for (const vid of selectedElements) {
                selectedProps.push(
                    await elementEditionProps(
                        currentUserId,
                        pageId,
                        Video,
                        vid,
                        vid.attribs.id,
                        ELEMENT_TYPES[type].name
                    )
                );
            }
            return selectedProps;

        default:
            break;
    }
}

async function getElementsProps(currentUserId, pageId, elements) {
    const allProps = {};

    for (const type of Object.keys(ELEMENT_TYPES)) {
        allProps[type] = await getElementPropsByType(
            currentUserId,
            pageId,
            elements,
            type
        );
    }
    return allProps;
}

const editor = async (currentUserId, model) => {
    let editor;
    if (model) {
        editor = await User.findByPk(model.editorId);
    } else {
        editor = await User.findOne({ where: { name: 'Víctor' } });
    }

    return model !== null
        ? currentUserId === editor.id
            ? 'Tú'
            : editor.name
        : undefined;
};

const elementEditionProps = async (
    currentUserId,
    pageId,
    model,
    element,
    elementName,
    type
) => {
    const elementDB =
        pageId === undefined
            ? null
            : await model.findOne({
                  where: { pageId, name: elementName },
              });

    if (elementDB === null) {
        await addElementToDB(element, currentUserId, pageId);
    }

    return {
        name: elementName,
        id: elementDB === null ? undefined : elementDB.id,
        type,
        editions: elementDB === null ? undefined : elementDB.editions,
        editor: await editor(currentUserId, elementDB),
        lastEdition: elementDB === null ? undefined : elementDB.updatedAt,
    };
};

async function addElementToDB(element, editorId, pageId) {
    if (pageId) {
        switch (element.name) {
            case 'title':
                await Metatag.create({
                    name: 'title',
                    value: element.children[0].data,
                    editorId,
                    pageId,
                });
                break;

            case 'meta':
                await Metatag.create({
                    name: element.attribs.name,
                    value: element.attribs.content,
                    editorId,
                    pageId,
                });
                break;

            case 'p':
                await Text.create({
                    name: element.attribs.id,
                    content: element.children[0].data,
                    editorId,
                    pageId,
                });
                break;

            case 'img':
                await Image.create({
                    name: element.attribs.id,
                    source: element.attribs.src,
                    alt: element.attribs.alt,
                    width: element.attribs.width,
                    height: element.attribs.height,
                    editorId,
                    pageId,
                });
                break;

            case 'video':
                await Video.create({
                    name: element.attribs.id,
                    source: element.attribs.src,
                    width: element.attribs.width,
                    height: element.attribs.height,
                    autoplay: Object.keys(element.attribs).includes('autoplay')
                        ? true
                        : false,
                    controls: Object.keys(element.attribs).includes('controls')
                        ? true
                        : false,
                    loop: Object.keys(element.attribs).includes('loop')
                        ? true
                        : false,
                    muted: Object.keys(element.attribs).includes('muted')
                        ? true
                        : false,
                    editorId,
                    pageId,
                });
                break;

            default:
                break;
        }
    }
}

export { getElementsProps, ELEMENT_TYPES };
