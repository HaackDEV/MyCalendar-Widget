const ical = require('node-ical');
const fs = require('fs/promises');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

// Read the files and convert to a JS object.
async function readConfig() {
    try {
        const data = await fs.readFile(configPath, 'utf8');
        const dataConfig = JSON.parse(data);
        return dataConfig;
    } catch (error) {
        console.error('Error: Cannot read config.json:', error);
    }
}

// Download .ics file.
async function downloadIcsFile(url) {
    try {
        const calendarDate = await ical.async.fromURL(url);
        return calendarDate;
    } catch (error) {
        console.error('Error: Cannot download this file:', error);
    }
}

// Filter events on current day and return an array.
function filterTodayEvents(calendarDate) {
    try {
        const today = new Date;

        // Create today bound (00:00:00 até 23:59:59).
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const events = Object.values(calendarDate).filter(item => item.type === 'VEVENT');

        return events.filter(event => {
            // Check if isn't a recurring event.
            if (event.start && !event.rrule) {
                const eventDate = new Date (event.start);
                return eventDate >= startToday && eventDate <= endToday;
            }
            // Check if is a recurring event.
            if (event.rrule){
                 const occurrences = event.rrule.between(startToday, endToday, true);
                 return occurrences.length > 0;
            }

            return false;
    })
    } catch (error) {
        console.error('Error: Cannot find any event', error);
        return [];
    }
}

// Filter events on current week and return an array.
function filterWeekEvents(calendarDate){
    try {
        const today = new Date;

        // Calculate week bound (start: today + 1 day, end: +7 days)
        const startWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const endWeek = new Date(startWeek);
        endWeek.setDate(startWeek.getDate() + 7);
        endWeek.setHours(23, 59, 59, 999);

        const events = Object.values(calendarDate).filter(item => item.type === 'VEVENT');

        return events.filter(event => {
            // Check if isn't a recurring event.
            if (event.start && !event.rrule) {
                const eventDate = new Date (event.start);
                return eventDate >= startWeek && eventDate <= endWeek;
            }
            
            // Check if it's a recurring event.
            if (event.rrule){
                 const occurrences = event.rrule.between(startWeek, endWeek, true);
                 return occurrences.length > 0;
            }

            return false;
        })
    } catch (error) {
        console.error('Error: Cannot find any event', error);
        return [];
    }
}

async function main() {

    const config = await readConfig();
    const ical_url = config.ical_url;
    console.log(config?.ical_url);
    const calendarDate = await downloadIcsFile(ical_url);
    console.log(Object.keys(calendarDate).length);
    const weekEvents = filterWeekEvents(calendarDate)
    console.log(weekEvents);
    const todayEvents = filterTodayEvents(calendarDate);
    console.log(todayEvents);
}

main();

