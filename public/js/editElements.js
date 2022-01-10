// Selectors
let formContainer = document.querySelector('.lwe-edit-form-container');
let editTitleForm = document.querySelector('#lwe-edit-title-form');
let editMetatagForm = document.querySelector('#lwe-edit-metatag-form');
let editTextForm = document.querySelector('#lwe-edit-text-form');
let editImageForm = document.querySelector('#lwe-edit-image-form');
let editVideoForm = document.querySelector('#lwe-edit-video-form');
const editTitleBtn = document.querySelector('#lwe-edit-title');
const closeEditFormBtn = document.querySelector('#lwe-close-edit-form');
const optionsContent = document.querySelector('#lwe-options-container');
const optionsBtn = document.querySelector('#lwe-options-button');
const hideLinesCheck = document.querySelector('#lwe-hide-lines');

// Constants
const TYPES_OBJ = {
    P: 'text',
    IMG: 'image',
    VIDEO: 'video',
};

const editForms = [
    editTitleForm,
    editMetatagForm,
    editTextForm,
    editImageForm,
    editVideoForm,
];

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    const editableElements = document.querySelectorAll('.editable');

    // Open the edit form every time an editable element is clicked
    for (const element of editableElements) {
        element.classList.add('outline');
        element.addEventListener('mousedown', () => {
            const elementObj = {
                type: TYPES_OBJ[element.tagName],
                name: element.id,
            };
            openEditForm(elementObj);
        });
    }

    // Create buttons to edit metatags
    const projectSlug = window.location.pathname.split('/')[2];
    const pageName = window.location.pathname.split('/')[3];

    const URL = `/api/elements/${projectSlug}/${pageName}/metatag`;
    const response = await fetch(URL);
    const metatags = await response.json();
    for (const meta of metatags) {
        // Create the lwe-form-element and the button
        const metaBtnDiv = document.createElement('div');
        metaBtnDiv.classList.add('lwe-form-element');
        const metaBtn = document.createElement('button');
        metaBtn.classList.add('lwe-edit-metatag');
        metaBtn.id = `edit-metatag-${meta.id}`;
        metaBtn.innerText = `Editar metatag ${meta.name}`;

        // Add the click event to the button
        metaBtn.addEventListener('click', () => {
            const elementObj = {
                type: 'metatag',
                name: meta.name,
            };
            openEditForm(elementObj);
        });
        // Append the button to the options container
        metaBtnDiv.appendChild(metaBtn);
        optionsContent.appendChild(metaBtnDiv);
    }

    // Add submit event listener to each form
    for (const form of editForms) {
        form.addEventListener('submit', async event => {
            event.preventDefault();

            const elementId = document.querySelector('#element-id').value;
            let elementType;
            let formInputs;

            // Build the element object according to the element type
            let body = new FormData();
            switch (form) {
                case editTitleForm:
                    elementType = 'title';
                    formInputs = getInputSelectors('title');
                    body.append('element-value', formInputs[0].value);
                    break;

                case editMetatagForm:
                    elementType = 'metatag';
                    formInputs = getInputSelectors('metatag');
                    body.append('element-name', formInputs[0].value);
                    body.append('element-value', formInputs[1].value);
                    break;

                case editTextForm:
                    elementType = 'text';
                    formInputs = getInputSelectors('text');
                    body.append('element-name', formInputs[0].value);
                    // Instead of getting the value of the textarea, the value
                    // of the ckeditor instance must be taken
                    body.append(
                        'element-content',
                        CKEDITOR.instances['text-content'].getData()
                    );
                    break;

                case editImageForm:
                    elementType = 'image';
                    formInputs = getInputSelectors('image');
                    body.append('element-name', formInputs[0].value);
                    body.append('element-alt', formInputs[1].value);
                    body.append('element-width', formInputs[2].value);
                    body.append('element-height', formInputs[3].value);
                    body.append('element-upload', formInputs[4].files[0]);
                    break;

                case editVideoForm:
                    elementType = 'video';
                    formInputs = getInputSelectors('video');
                    body.append('element-name', formInputs[0].value);
                    body.append('element-width', formInputs[1].value);
                    body.append('element-height', formInputs[2].value);
                    if (formInputs[3].checked)
                        body.append('element-autoplay', 1);
                    if (formInputs[4].checked)
                        body.append('element-controls', 1);
                    if (formInputs[5].checked) body.append('element-loop', 1);
                    if (formInputs[6].checked) body.append('element-muted', 1);
                    body.append('element-upload', formInputs[7].files[0]);
                default:
                    break;
            }

            // Show spinner
            showSpinner(form);
            // Send the element object to the api
            const URL = `/api/element/${elementType}/${elementId}`;
            const res = await fetch(URL, {
                method: 'PUT',
                mode: 'cors',
                credentials: 'include',
                // If I want to send an object then I have to include
                // headers: { Content-Type: 'application/json' }
                // But I should omit headers when sending a FormData body
                body,
            });
            const message = await res.json();

            // Hide spinner
            hideSpinner(form);
            console.log(message);
            if (message.error) {
                alert(message.error);
                closeEditFormBtn.click();
            } else {
                location.reload();
            }
        });
    }
});

// Hide edit forms once the close button is clicked
closeEditFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('lwe-container-active');
    editTitleForm.classList.remove('lwe-edit-form-active');
    editMetatagForm.classList.remove('lwe-edit-form-active');
    editTextForm.classList.remove('lwe-edit-form-active');
    if (CKEDITOR.instances['text-content']) {
        CKEDITOR.instances['text-content'].destroy();
    }
    editImageForm.classList.remove('lwe-edit-form-active');
    editVideoForm.classList.remove('lwe-edit-form-active');
});

// Hide the border lines delimiting an editable element
hideLinesCheck.addEventListener('change', () => {
    const editableElements = document.querySelectorAll('.editable');
    for (const element of editableElements) {
        hideLinesCheck.checked
            ? element.classList.remove('outline')
            : element.classList.add('outline');
    }
});

// Show hide options (edit title, metatags...)
optionsBtn.addEventListener('click', () => {
    if (optionsContent.style.display === 'block') {
        optionsContent.style.display = 'none';
        optionsBtn.textContent = 'Mostrar opciones';
        optionsBtn.classList.remove('lwe-active');
    } else {
        optionsContent.style.display = 'block';
        optionsBtn.textContent = 'Ocultar opciones';
        optionsBtn.classList.add('lwe-active');
    }
});

editTitleBtn.addEventListener('click', () => {
    const elementObj = {
        type: 'title',
        name: 'title',
    };
    openEditForm(elementObj);
});

// Functions
async function openEditForm(element) {
    switch (element.type) {
        case 'title':
            saveElementData(editTitleForm, element);
            break;
        case 'metatag':
            saveElementData(editMetatagForm, element);
            break;
        case 'text':
            saveElementData(editTextForm, element);
            break;
        case 'image':
            saveElementData(editImageForm, element);
            break;
        case 'video':
            saveElementData(editVideoForm, element);
        default:
            break;
    }
}

async function getElementData(element) {
    const projectSlug = window.location.pathname.split('/')[2];
    const pageName = window.location.pathname.split('/')[3];

    const URL = `/api/element/${projectSlug}/${pageName}/${element.type}/${element.name}`;
    const response = await fetch(URL);
    const result = await response.json();
    return result;
}

async function saveElementData(editForm, element) {
    // Show the form
    formContainer.classList.add('lwe-container-active');
    editForm.classList.add('lwe-edit-form-active');

    const response = await getElementData(element);
    if (response.error) {
        // Close the form
        closeEditFormBtn.click();
        alert(response.error);
    } else {
        setInputSelectors(element.type, response);

        // Since the edit text form could be opened multiple times without
        // reloading the page, the ckeditor textarea must be updated every time
        // the form is opened. The previous ckeditor instance must be destroyed
        // because it is replacing a textarea with a constant id
        if (element.type === 'text') {
            if (CKEDITOR.instances['text-content']) {
                CKEDITOR.instances['text-content'].destroy();
            }
            CKEDITOR.replace('text-content');
        }
    }
}

function getInputSelectors(elementType) {
    let selectors = [];
    switch (elementType) {
        case 'title':
            const titleValueInput = document.querySelector('#title-value');
            selectors.push(titleValueInput);
            break;

        case 'metatag':
            const metatagNameInput = document.querySelector('#metatag-name');
            selectors.push(metatagNameInput);

            const metatagValueInput = document.querySelector('#metatag-value');
            selectors.push(metatagValueInput);
            break;

        case 'text':
            const textNameInput = document.querySelector('#text-name');
            selectors.push(textNameInput);

            const textContentInput = document.querySelector('#text-content');
            selectors.push(textContentInput);
            break;

        case 'image':
            const imageNameInput = document.querySelector('#image-name');
            selectors.push(imageNameInput);

            const imageAltInput = document.querySelector('#image-alt');
            selectors.push(imageAltInput);

            const imageWidthInput = document.querySelector('#image-width');
            selectors.push(imageWidthInput);

            const imageHeightInput = document.querySelector('#image-height');
            selectors.push(imageHeightInput);

            const imageUploadInput = document.querySelector('#image-upload');
            selectors.push(imageUploadInput);
            break;

        case 'video':
            const videoNameInput = document.querySelector('#video-name');
            selectors.push(videoNameInput);

            const videoWidthInput = document.querySelector('#video-width');
            selectors.push(videoWidthInput);

            const videoHeightInput = document.querySelector('#video-height');
            selectors.push(videoHeightInput);

            const videoAutoplayInput =
                document.querySelector('#video-autoplay');
            selectors.push(videoAutoplayInput);

            const videoControlsInput =
                document.querySelector('#video-controls');
            selectors.push(videoControlsInput);

            const videoLoopInput = document.querySelector('#video-loop');
            selectors.push(videoLoopInput);

            const videoMutedInput = document.querySelector('#video-muted');
            selectors.push(videoMutedInput);

            const videoUploadInput = document.querySelector('#video-upload');
            selectors.push(videoUploadInput);
            break;

        default:
            break;
    }
    return selectors;
}

function setInputSelectors(elementType, elementData) {
    const elementIdInput = document.querySelector('#element-id');
    elementIdInput.value = elementData.id;

    switch (elementType) {
        case 'title':
            const titleValueInput = document.querySelector('#title-value');
            titleValueInput.value = elementData.value;
            break;

        case 'metatag':
            const metatagNameInput = document.querySelector('#metatag-name');
            metatagNameInput.value = elementData.name;

            const metatagValueInput = document.querySelector('#metatag-value');
            metatagValueInput.value = elementData.value;
            break;

        case 'text':
            const textNameInput = document.querySelector('#text-name');
            textNameInput.value = elementData.name;

            const textContentInput = document.querySelector('#text-content');
            const pContainer = document.createElement('p');
            pContainer.innerHTML = elementData.content;
            pContainer.style = elementData.style;
            textContentInput.value = pContainer.outerHTML;
            break;

        case 'image':
            const imageNameInput = document.querySelector('#image-name');
            imageNameInput.value = elementData.name;

            const imageAltInput = document.querySelector('#image-alt');
            imageAltInput.value = elementData.alt;

            const imageWidthInput = document.querySelector('#image-width');
            imageWidthInput.value = elementData.width;

            const imageHeightInput = document.querySelector('#image-height');
            imageHeightInput.value = elementData.height;

            const imageUploadLabel = document.querySelector(
                '#image-upload-label'
            );
            imageUploadLabel.innerHTML = `Subir archivo. El actual es: <strong>${elementData.source}</strong>`;
            break;

        case 'video':
            const videoNameInput = document.querySelector('#video-name');
            videoNameInput.value = elementData.name;

            const videoWidthInput = document.querySelector('#video-width');
            videoWidthInput.value = elementData.width;

            const videoHeightInput = document.querySelector('#video-height');
            videoHeightInput.value = elementData.height;

            const videoAutoplayInput =
                document.querySelector('#video-autoplay');
            if (elementData.autoplay) {
                videoAutoplayInput.checked = true;
            } else {
                videoAutoplayInput.checked = false;
            }

            const videoControlsInput =
                document.querySelector('#video-controls');
            if (elementData.controls) {
                videoControlsInput.checked = true;
            } else {
                videoControlsInput.checked = false;
            }

            const videoLoopInput = document.querySelector('#video-loop');
            if (elementData.loop) {
                videoLoopInput.checked = true;
            } else {
                videoLoopInput.checked = false;
            }

            const videoMutedInput = document.querySelector('#video-muted');
            if (elementData.muted) {
                videoMutedInput.checked = true;
            } else {
                videoMutedInput.checked = false;
            }

            const videoUploadLabel = document.querySelector(
                '#video-upload-label'
            );
            videoUploadLabel.innerHTML = `Subir archivo. El actual es: <strong>${elementData.source}</strong>`;
            break;

        default:
            break;
    }
}
