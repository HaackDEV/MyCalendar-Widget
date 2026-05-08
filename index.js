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
        const calendarDate = ical.async.fromURL(url);
        return calendarDate;
    } catch (error) {
        console.error('Error: Cannot download this file:', error);
    }
}

async function main() {

    const config = await readConfig();
    const ical_url = config.ical_url;
    console.log(config?.ical_url);
    const calendarDate = await downloadIcsFile(ical_url);
    console.log(Object.keys(calendarDate).length);
}

main();
