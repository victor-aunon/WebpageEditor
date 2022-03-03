const projectsInput = document.querySelector('#project-input');

const projectsDatalist = document.querySelector('#projects');

/**
 * @description Add listeners when the DOM is loaded
 * @date 03/03/2022
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add a spinner when the edit form is submitted until the request is done
    const formSubmitButton = document.querySelector('#form-submit');
    if (formSubmitButton) {
        formSubmitButton.addEventListener('click', () => {
            const form = document.querySelector('.edit-element');
            showSpinner(form);
        });
    }

    // Ask the user wether he agrees to delete a project and do the request
    const formDeleteProject = document.querySelector('#delete-project-form');
    if (formDeleteProject) {
        formDeleteProject.addEventListener('submit', async event => {
            event.preventDefault();
            const projectName =
                formDeleteProject.elements['project-input'].value;
            
            const input = confirm(
                `¿De verdad quieres eliminar el proyecto ${projectName}?`
            );
            if (input) {
                formDeleteProject.action = `/delete-project/${projectName}`;
                formDeleteProject.submit();
            }
        });
    }
});

if (projectsInput) {
    projectsInput.onfocus = () => (projectsDatalist.style.display = 'block');
    projectsInput.onblur = () => (projectsDatalist.style.display = 'none');
}

/**
 * @description Open the pressed tab and hide the others
 * @author Víctor Auñón
 * @date 03/03/2022
 * @param {*} event The button click event
 * @param {string} tab The name of the page
 */
function openTab(event, tab) {
    const tabContents = document.querySelectorAll('.tabcontent');

    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    const tabLinks = document.querySelectorAll('.tablinks');

    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('active');
    }

    document.querySelector(`#${tab}-content`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

/**
 * @description Open the default tab
 * @author Víctor Auñón
 * @date 03/03/2022
 * @param {string} defaultTab The name of the page
 */
function openDefaultTab(defaultTab) {
    let defTab;
    if (defaultTab) {
        defTab = document.querySelector(`#${defaultTab}-button`);
    } else {
        defTab = document.querySelectorAll('.tablinks')[0];
    }

    if (defTab) {
        defTab.click();
    }
}

/**
 * @description Check the checkboxes whose data-value is true
 * @author Víctor Auñón
 * @date 03/03/2022
 */
function checkboxDefaultChecked() {
    const options = [
        document.querySelector('#element-autoplay'),
        document.querySelector('#element-controls'),
        document.querySelector('#element-loop'),
        document.querySelector('#element-muted'),
    ];

    options.forEach(option => {
        if (option.dataset.value === 'true') option.checked = true;
    });
}
