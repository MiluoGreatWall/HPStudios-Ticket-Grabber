// Flag to indicate whether tickets have been added to the cart
let ticketsAddedToCart = false;
let sessionIntervalId;

// This function sets the number of adult tickets
function setAdultTickets(adultTicketsWanted) {
    const adultTicketsCount = parseInt($('.quantity-control.row > input')[0].value, 10);
    const ticketChangeIterations = Math.abs(adultTicketsWanted - adultTicketsCount);
    const ticketChangeButton = $(`.quantity-control.row > button.typcn-${adultTicketsCount < adultTicketsWanted ? 'plus' : 'minus'}`)[0];

    for (let i = 0; i < ticketChangeIterations; i++) {
        ticketChangeButton.click();
    }
}

function playSound(src) {
    return new Promise((resolve) => {
        const audio = new Audio(src);
        audio.onended = resolve;
        audio.play();
    });
}

function repeatHeyListen() {
    playSound('https://www.myinstants.com/media/sounds/hey_listen.mp3')
        .then(repeatHeyListen);
}

function waitForAvailability() {
    return new Promise((resolve) => {
        function checkLoading() {
            const isLoading = $('.calendar-modal[data-component=eventTimeModal] .modal-content > .loading-mask').is(':visible');
            if (isLoading) {
                setTimeout(checkLoading, 500);
            } else {
                const availableEls = $('.calendar .calendar-body .day.available');
                resolve(availableEls);
            }
        }
        checkLoading();
    });
}

function playSounds() {
    playSound('https://www.myinstants.com/media/sounds/mlg-airhorn.mp3')
        .then(() => playSound('https://www.myinstants.com/media/sounds/sound-9______.mp3'))
        .then(() => playSound('https://www.myinstants.com/media/sounds/ps_1.mp3'))
        .then(() => playSound('https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3'))
        .then(() => playSound('https://www.myinstants.com/media/sounds/lalalalala.swf.mp3'))
        .then(() => playSound('https://www.myinstants.com/media/sounds/tuturu_1.mp3'))
        .then(() => playSound('https://www.myinstants.com/media/sounds/hallelujahshort.swf.mp3'))
        .then(repeatHeyListen);
}

function addTicketsToBasket(dayElement) {
    dayElement.click();

    setTimeout(() => waitForAvailability()
        .then(() => {
            $('.ui-control.button.select-time')[0].click();
            setTimeout(() => {
                $('.typcn.typcn-shopping-cart.ng-binding')[0].click();
                ticketsAddedToCart = true; // Set the flag
                console.log('Tickets have been added to the cart.');
                // Start keeping the session alive indefinitely
                if (sessionIntervalId) {
                    clearInterval(sessionIntervalId);
                }
                sessionIntervalId = setInterval(extendSessionIfNeeded, 3 * 60 * 1000); // Check every 3 minutes
            }, 2000);
        }), 2000);
}

// Function to get the displayed month and year from the calendar header
function getDisplayedMonthAndYear() {
    // Get the month and year select elements
    const monthSelectElement = document.querySelector('.calendar-modal select[name*="MonthDropDownList"]');
    const yearSelectElement = document.querySelector('.calendar-modal select[name*="YearDropDownList"]');

    if (!monthSelectElement || !yearSelectElement) {
        throw new Error('Could not find the month or year select elements.');
    }

    // Get the selected month and year values
    const selectedMonthValue = monthSelectElement.value;
    const selectedYearValue = yearSelectElement.value;

    // Remove 'string:' prefix if present
    const displayedMonth = parseInt(selectedMonthValue.replace('string:', ''), 10);
    const displayedYear = parseInt(selectedYearValue.replace('string:', ''), 10);

    if (isNaN(displayedMonth) || isNaN(displayedYear)) {
        throw new Error('Could not parse the selected month or year.');
    }

    return { displayedMonth, displayedYear };
}

// Function to navigate to the desired month and year by clicking arrows
function navigateToMonthAndYear(targetMonth, targetYear) {
    return new Promise((resolve, reject) => {
        function navigate() {
            let { displayedMonth, displayedYear } = getDisplayedMonthAndYear();
            console.log(`Currently displayed month/year: ${displayedMonth}/${displayedYear}`);
            if (displayedYear === targetYear && displayedMonth === targetMonth) {
                console.log(`Reached target month/year: ${displayedMonth}/${displayedYear}`);
                resolve();
            } else {
                // Decide whether to click 'next' or 'previous'
                let clickNext = false;
                if (displayedYear < targetYear || (displayedYear === targetYear && displayedMonth < targetMonth)) {
                    clickNext = true;
                }

                const buttonSelector = clickNext ? 'span[aria-label="Go to next month"]' : 'span[aria-label="Go to previous month"]';
                const buttonElement = document.querySelector(buttonSelector);
                if (buttonElement) {
                    console.log(`Clicking ${clickNext ? 'next' : 'previous'} button.`);
                    buttonElement.click();
                    setTimeout(navigate, 5000); // Adjust delay as needed
                } else {
                    console.error(`Could not find calendar navigation button using selector: ${buttonSelector}`);
                    reject('Could not find calendar navigation button.');
                }
            }
        }

        navigate();
    });
}

// Function to check and extend the session
function extendSessionIfNeeded() {
    const sessionWarningElement = document.querySelector('.warning .extendSession');
    if (sessionWarningElement) {
        console.log('Session is about to expire. Extending session...');
        sessionWarningElement.click();
    } else {
        // If the button doesn't exist, perform a minimal action to keep the session alive
        fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
            .then(() => console.log('Session kept alive via fetch'))
            .catch(err => console.error('Error keeping session alive:', err));
    }
}

// Main function to check for tickets
function checkForTickets(adultTicketsWanted = 2, checkFrequency = 3) {
    setAdultTickets(adultTicketsWanted);

    // Define the months and dates to check
    const monthsToCheck = [
        { month: 12, year: 2024, dates: [28, 29, 30, 31] },    // December 2024
        { month: 1, year: 2025, dates: [1, 2, 3] }          // January 2025
    ];

    function check() {
        if (ticketsAddedToCart) {
            console.log('Tickets have been added to the cart. Not checking for tickets anymore.');
            return;
        }

        document.querySelector('.shared-calendar-button').click();

        let monthIndex = 0;

        function checkNextMonth() {
            if (monthIndex >= monthsToCheck.length) {
                // All months checked, wait and repeat
                console.log(`Relevant dates not yet available. Will check again in ${checkFrequency} seconds.`);
                document.querySelector('.calendar-modal .close').click();
                setTimeout(check, checkFrequency * 1000);
                return;
            }

            const { month, year, dates } = monthsToCheck[monthIndex];

            navigateToMonthAndYear(month, year)
                .then(() => waitForAvailability())
                .then(availableEls => {
                    console.log(`Checking for relevant dates in ${month}/${year}...`);
                    let found = false;

                    // Filter availableEls to include only dates in the target month and year
                    const filteredEls = availableEls.filter(function () {
                        const $dayElement = $(this);
                        let dateStr = $dayElement.attr('aria-label');
                        if (!dateStr) {
                            return false;
                        }
                        dateStr = dateStr.trim();
                        const dateParts = dateStr.split('/');
                        if (dateParts.length < 3) {
                            return false;
                        }
                        const dayNumber = parseInt(dateParts[0], 10);
                        const monthNumber = parseInt(dateParts[1], 10);
                        const yearNumber = parseInt(dateParts[2], 10);
                        return monthNumber === month && yearNumber === year;
                    });

                    // Check for relevant dates in this month
                    filteredEls.each(function () {
                        const $dayElement = $(this);
                        let dateStr = $dayElement.attr('aria-label').trim();
                        const dateParts = dateStr.split('/');
                        const dayNumber = parseInt(dateParts[0], 10);

                        console.log(`Day ${dayNumber} is available on ${dateStr}...`);

                        if (dates.includes(dayNumber)) {
                            console.log(`Found tickets on ${dayNumber}/${month}/${year}!!!!!`);
                            playSounds();
                            addTicketsToBasket(this);
                            found = true;
                            return false; // Break out of each loop
                        }
                    });

                    if (!found) {
                        // Move to the next month
                        monthIndex++;
                        checkNextMonth();
                    }
                })
                .catch(err => {
                    console.error('Error in checkForTickets:', err);
                    setTimeout(check, checkFrequency * 1000); // Retry after the specified frequency
                });
        }

        checkNextMonth();
    }

    check();

    // Set up an interval to extend the session periodically
    sessionIntervalId = setInterval(extendSessionIfNeeded, 3 * 60 * 1000); // Check every 3 minutes
}

// Start the script
checkForTickets();
