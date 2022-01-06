function showSpinner(form) {
    const spinnerContainer = form.querySelector('.spinner-container');
    hideSpinner(form);
    const divSpinner = document.createElement('div');
    divSpinner.classList.add('sk-chase');
    divSpinner.innerHTML = `
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
    `;
    spinnerContainer.appendChild(divSpinner);
}

function hideSpinner(form) {
    const spinnerContainer = form.querySelector('.spinner-container');

    while (spinnerContainer.firstChild) {
        spinnerContainer.removeChild(spinnerContainer.firstChild);
    }
}