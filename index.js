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

async function main() {

    const config = await readConfig(); 
    console.log(config);
}

main();
