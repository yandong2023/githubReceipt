const usStates = require('../../data/us/states.json');
const usCities = require('../../data/us/cities.json');
const ukCities = require('../../data/uk/cities.json');
const { generateTempEmail } = require('./tempMailAPI');

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStreetNumber() {
    return generateRandomNumber(1, 9999).toString();
}

function generateZipCode(country) {
    if (country === 'us') {
        return generateRandomNumber(10000, 99999).toString();
    } else if (country === 'uk') {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return `${letters[generateRandomNumber(0, 25)]}${letters[generateRandomNumber(0, 25)]}${generateRandomNumber(1, 9)} ${generateRandomNumber(1, 9)}${letters[generateRandomNumber(0, 25)]}${letters[generateRandomNumber(0, 25)]}`;
    }
}

function generatePhoneNumber(country) {
    if (country === 'us') {
        return `+1 ${generateRandomNumber(200, 999)}-${generateRandomNumber(100, 999)}-${generateRandomNumber(1000, 9999)}`;
    } else if (country === 'uk') {
        return `+44 ${generateRandomNumber(100, 999)} ${generateRandomNumber(100, 999)} ${generateRandomNumber(1000, 9999)}`;
    }
}

async function generateAddress(country, city = '') {
    const streets = country === 'us' ? require('../../data/us/streets.json') : require('../../data/uk/streets.json');
    const cities = country === 'us' ? usCities : ukCities;
    const states = country === 'us' ? usStates : [];
    
    const selectedCity = city || cities[generateRandomNumber(0, cities.length - 1)];
    const street = streets[generateRandomNumber(0, streets.length - 1)];
    const streetNumber = generateStreetNumber();
    const zipCode = generateZipCode(country);
    const phoneNumber = generatePhoneNumber(country);
    const email = await generateTempEmail();
    
    if (country === 'us') {
        const state = states[generateRandomNumber(0, states.length - 1)];
        return {
            streetNumber,
            street,
            city: selectedCity,
            state: state.abbreviation,
            country: 'United States',
            zipCode,
            phoneNumber,
            email
        };
    } else {
        return {
            streetNumber,
            street,
            city: selectedCity,
            country: 'United Kingdom',
            postCode: zipCode,
            phoneNumber,
            email
        };
    }
}

module.exports = {
    generateAddress,
    generateRandomNumber
};
