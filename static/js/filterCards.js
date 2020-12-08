const filtersArr = Array.from(document.getElementsByClassName('form-group'));

const getFilters = function (filtersArr) {
    filtersArr.forEach(filter => {
        filter.addEventListener('change', renderCards(getFilters()))
    });
};

function getFilters() {
    let selectedFilters = [];
    filtersArr.forEach((filter) => {
        if (filter.value) {
            selectedFilters.push(filter.value)
        }
    })
    return selectedFilters
};

// function renderCards(selectedFilters = []) {

// }