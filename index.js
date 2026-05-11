const ical = require('node-ical');
const fs = require('fs/promises');
const path = require('path');
const ini = require('ini');

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
        
        let filtered = [];

        events.forEach(event => {
            // Check if isn't a recurring event.
            if (event.start && !event.rrule) {
                const eventDate = new Date (event.start);
                if (eventDate >= startToday && eventDate <= endToday){
                    filtered.push({...event, actualDate: eventDate});
                }
            }
            // Check if is a recurring event.
            if (event.rrule){
                 const occurrences = event.rrule.between(startToday, endToday, true);
                 if (occurrences.length > 0){
                    filtered.push({...event, actualDate: occurrences[0]});
                 }
            }
        });

        return filtered.sort((a, b) => a.actualDate - b.actualDate);

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

        let filtered = [];

        events.forEach(event => {
            // Check if isn't a recurring event.
            if (event.start && !event.rrule) {
                const eventDate = new Date (event.start);
                if (eventDate >= startWeek && eventDate <= endWeek){
                    filtered.push({...event, actualDate: eventDate});
                }
            }
            // Check if is a recurring event.
            if (event.rrule){
                 const occurrences = event.rrule.between(startWeek, endWeek, true);
                 if (occurrences.length > 0){
                    filtered.push({...event, actualDate: occurrences[0]});
                 }
            }
        })

        return filtered.sort((a, b) => a.actualDate - b.actualDate);

    } catch (error) {
        console.error('Error: Cannot find any event', error);
        return [];
    }
}

// Export filtered events to an .ini file formatted for Rainmeter.
async function exportToIni(fileName, sectionName, events, showTime = false) {
        try {
            let formatedObj = {
                [sectionName]: {
                    Count: events.length
                }
            }

            events.forEach((event, index) => {
                let tittle = event.summary;
                let finalText = tittle;

                if (showTime && event.actualDate) {
                    const eventDate = new Date(event.start);
                    const hour = String(eventDate.getHours()).padStart(2, '0');
                    const minutes = String(eventDate.getMinutes()).padStart(2, '0');
                    finalText = `${hour}:${minutes} - ${tittle}`;
                };
            
                formatedObj[sectionName] [`event${index + 1}`] = finalText;
            });
            
            const iniString = ini.stringify(formatedObj);

            const filePath = path.join(__dirname, fileName);
            await fs.writeFile(filePath, iniString, 'utf8');
            console.log(`${fileName} success exported.`)

        } catch (error) {
            console.error('Error: Cannot export this file', error);
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

    await exportToIni("today/today.ini", "Today", todayEvents, true);
    await exportToIni("week/week.ini", "Week", weekEvents, false);
}

main();

