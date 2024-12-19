// 美国地址数据
export const US_DATA = {
    states: [
        { name: 'California', abbr: 'CA', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'] },
        { name: 'New York', abbr: 'NY', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse'] },
        { name: 'Texas', abbr: 'TX', cities: ['Houston', 'Austin', 'Dallas', 'San Antonio'] },
        { name: 'Florida', abbr: 'FL', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'] }
    ],
    streets: [
        'Main Street', 'Oak Avenue', 'Maple Drive', 'Cedar Lane', 'Pine Road',
        'Washington Street', 'Park Avenue', 'Broadway', 'Lake Drive', 'Forest Lane'
    ],
    firstNames: [
        'James', 'John', 'Robert', 'Michael', 'William',
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth'
    ],
    lastNames: [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
        'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
    ],
    companies: [
        'Tech Solutions Inc', 'Global Systems LLC', 'Advanced Industries',
        'Premier Services', 'Elite Enterprises', 'Innovation Corp'
    ]
};

// 英国地址数据
export const UK_DATA = {
    regions: [
        { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Liverpool'] },
        { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'] },
        { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport', 'Bangor'] },
        { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn', 'Bangor'] }
    ],
    streets: [
        'High Street', 'Church Lane', 'Station Road', 'Victoria Road', 'King Street',
        'Queen Street', 'Market Street', 'Bridge Road', 'Grove Road', 'Mill Lane'
    ],
    firstNames: [
        'Oliver', 'Jack', 'Harry', 'George', 'Charlie',
        'Olivia', 'Emily', 'Isla', 'Ava', 'Sophie'
    ],
    lastNames: [
        'Smith', 'Jones', 'Taylor', 'Brown', 'Williams',
        'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright'
    ],
    companies: [
        'British Systems Ltd', 'UK Solutions PLC', 'Royal Industries',
        'Crown Services', 'Thames Enterprises', 'London Corp'
    ]
};

// 生成随机数的辅助函数
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 从数组中随机选择一个元素
export function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 生成随机街道号码
export function generateStreetNumber() {
    return getRandomInt(1, 9999);
}

// 生成随机邮编
export function generatePostalCode(country) {
    if (country === 'US') {
        return getRandomInt(10000, 99999).toString();
    } else if (country === 'UK') {
        const area = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const district = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const num = getRandomInt(1, 99);
        const sector = getRandomInt(1, 9);
        const unit = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return `${area}${district}${num} ${sector}${unit}`;
    }
}

// 生成随机电话号码
export function generatePhoneNumber(country) {
    if (country === 'US') {
        const area = getRandomInt(200, 999);
        const prefix = getRandomInt(200, 999);
        const line = getRandomInt(1000, 9999);
        return `+1 (${area}) ${prefix}-${line}`;
    } else if (country === 'UK') {
        const area = getRandomInt(100, 999);
        const prefix = getRandomInt(1000, 9999);
        const line = getRandomInt(1000, 9999);
        return `+44 ${area} ${prefix} ${line}`;
    }
}

// 生成随机生日
export function generateBirthday() {
    const year = getRandomInt(1960, 2000);
    const month = getRandomInt(1, 12);
    const day = getRandomInt(1, 28); // 使用28避免月份天数问题
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}
