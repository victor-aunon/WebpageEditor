const projectsInput = document.querySelector('#project-input');

const projectsDatalist = document.querySelector('#projects');

if (projectsInput) {
    projectsInput.onfocus = () => (projectsDatalist.style.display = 'block');
    projectsInput.onblur = () => (projectsDatalist.style.display = 'none');
}

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

function openDefaultTab() {
    const defaultTab = document.querySelectorAll('.tablinks')[0];

    if (defaultTab) {
        defaultTab.click();
    }
}
