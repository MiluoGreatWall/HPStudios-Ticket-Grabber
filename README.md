# Ticket Grabbing Script for Harry Potter Studios in London

This script automates the process of grabbing tickets for the Harry Potter studios by checking availability for specific dates, selecting the required number of tickets, and adding them to the basket. It includes features to simulate user interactions and ensure you don't miss the tickets you're after!

## Features of This Script:
- **Automatic Ticket Selection**: The script allows you to select the number of adult tickets you want and automatically adjusts the selection on the page.
- **Month and Year Selector**: It automates the selection of target months and years for specific event dates.
- **Availability Checking**: Continuously checks for available dates based on the specified months and days.
- **Sound Alerts**: Plays a series of fun sound effects to notify you when tickets are available.
- **Basket Automation**: Automatically adds the tickets to the basket once availability is detected.
- **Session Extension**: Monitors session expiration warnings and automatically extends the session to prevent timeouts.
- **Continuous Monitoring**: The script repeatedly checks for tickets at set intervals and handles errors gracefully.
- **Customizable Dates and Frequencies**: Easily change the months, days, and the frequency at which the script checks for tickets.

## Usage:
1. Ensure you're on the Harry Potter ticket website page.
2. Press the "SELECT DATE AND TIME" button.
3. Open your browser's Developer Tools (usually accessible by pressing F12).
4. Go to the **Console** tab.
5. Paste the entire script into the console and press Enter.
6. The script will start running, and it will alert you when tickets for your specified dates become available.

## Credits:
This script is based on an original version by [Rovack](https://gist.github.com/Rovack/51e0fb558ee0fa4ce0e2cd5f0ab17cb1). I have enriched the original version with new features such as session extension functionality and a more robust process for handling date availability.

## Customization:
- You can modify the months and dates to check for tickets by editing the `monthsToCheck` array.
- The number of adult tickets can be adjusted by changing the `adultTicketsWanted` parameter in the `checkForTickets` function.
- The interval between checks can be modified by changing the `checkFrequency` parameter (default is 15 seconds).
