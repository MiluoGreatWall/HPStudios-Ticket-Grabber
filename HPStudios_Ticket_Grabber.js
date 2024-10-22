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
            }, 2000);
        }), 2000);
}

// Function to select the desired year and month
function selectMonthAndYear(targetMonth, targetYear) {
    return new Promise((resolve, reject) => {
        const monthSelectElement = document.querySelector('select[name*="MonthDropDownList"]');
        const yearSelectElement = document.querySelector('select[name*="YearDropDownList"]');

        if (!monthSelectElement || !yearSelectElement) {
            reject('Could not find month or year elements. Check the selectors.');
            return;
        }

        // Prepare the target values with 'string:' prefix
        const targetMonthValue = 'string:' + targetMonth.toString();
        const targetYearValue = 'string:' + targetYear.toString();

        // Use AngularJS elements to simulate user interaction
        const monthSelectAngularElement = angular.element(monthSelectElement);
        const yearSelectAngularElement = angular.element(yearSelectElement);

        // Update the select elements and trigger AngularJS change detection
        yearSelectAngularElement.val(targetYearValue).triggerHandler('change');
        monthSelectAngularElement.val(targetMonthValue).triggerHandler('change');

        // Wait for the calendar to update
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

// Function to check and extend the session
function extendSessionIfNeeded() {
    const sessionWarningElement = document.querySelector('.warning .extendSession');
    if (sessionWarningElement) {
        console.log('Session is about to expire. Extending session...');
        sessionWarningElement.click();
    }
}

// Main function to check for tickets
function checkForTickets(adultTicketsWanted = 2, checkFrequency = 15) {
    setAdultTickets(adultTicketsWanted);

    // Define the months and dates to check
    const monthsToCheck = [
        { month: 12, year: 2024, dates: [27, 28, 29, 30, 31] },    // December 2024
        { month: 1, year: 2025, dates: [1, 2, 3, 4] }          // January 2025
    ];

    function check() {
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

            selectMonthAndYear(month, year)
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
    setInterval(extendSessionIfNeeded, 5 * 60 * 1000); // Check every 5 minutes
}

// Start the script
checkForTickets();
