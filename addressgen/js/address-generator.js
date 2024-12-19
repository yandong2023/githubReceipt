import {
    US_DATA,
    getRandomElement,
    generateStreetNumber,
    generatePostalCode,
    generatePhoneNumber,
    generateBirthday
} from './address-data.js';

class AddressGenerator {
    constructor() {
        this.currentData = US_DATA;
        // 等待DOM加载完成后再初始化事件监听
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            // 生成一个初始地址
            this.generateRandomAddress();
        });
    }

    setupEventListeners() {
        // 获取DOM元素
        const searchBtn = document.getElementById('search_btn');
        const randomBtn = document.getElementById('for-us-btn-2');
        const saveBtn = document.getElementById('save-address');

        // 添加事件监听
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.generateAddress());
        }
        if (randomBtn) {
            randomBtn.addEventListener('click', () => this.generateRandomAddress());
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAddress());
        }
    }

    generateRandomAddress() {
        const address = this.generateAddressData();
        this.displayAddress(address);
    }

    generateAddress() {
        const cityInput = document.getElementById('city');
        const city = cityInput ? cityInput.value.trim() : '';
        const address = this.generateAddressData(city);
        this.displayAddress(address);
    }

    generateAddressData(specificCity = '') {
        const data = this.currentData;
        const state = getRandomElement(data.states);
        const city = specificCity || getRandomElement(state.cities);

        const streetNumber = generateStreetNumber();
        const street = getRandomElement(data.streets);
        const postalCode = generatePostalCode('US');
        const firstName = getRandomElement(data.firstNames);
        const lastName = getRandomElement(data.lastNames);
        const company = getRandomElement(data.companies);
        const phone = generatePhoneNumber('US');
        const birthday = generateBirthday();

        return {
            fullName: `${firstName} ${lastName}`,
            gender: Math.random() > 0.5 ? '男' : '女',
            birthday,
            title: `${company} - ${Math.random() > 0.5 ? 'Manager' : 'Director'}`,
            company,
            street: `${streetNumber} ${street}`,
            city,
            state: state.name,
            postalCode,
            phone
        };
    }

    displayAddress(address) {
        // 更新页面上的地址信息
        const elements = {
            fullName: document.querySelector('.data_Full_Name'),
            gender: document.querySelector('.data_Gender'),
            birthday: document.querySelector('.data_Birthday'),
            title: document.querySelector('.data_Title'),
            address: document.querySelector('.data_Address'),
            phone: document.querySelector('.data_Phone')
        };

        if (elements.fullName) elements.fullName.value = address.fullName;
        if (elements.gender) elements.gender.value = address.gender;
        if (elements.birthday) elements.birthday.value = address.birthday;
        if (elements.title) elements.title.value = address.title;
        
        // 格式化地址
        const formattedAddress = `${address.street}\n${address.city}, ${address.state} ${address.postalCode}`;
        if (elements.address) elements.address.value = formattedAddress;
        if (elements.phone) elements.phone.value = address.phone;
    }

    saveAddress() {
        const elements = {
            fullName: document.querySelector('.data_Full_Name'),
            gender: document.querySelector('.data_Gender'),
            birthday: document.querySelector('.data_Birthday'),
            title: document.querySelector('.data_Title'),
            address: document.querySelector('.data_Address'),
            phone: document.querySelector('.data_Phone')
        };

        const currentAddress = {
            fullName: elements.fullName ? elements.fullName.value : '',
            gender: elements.gender ? elements.gender.value : '',
            birthday: elements.birthday ? elements.birthday.value : '',
            title: elements.title ? elements.title.value : '',
            address: elements.address ? elements.address.value : '',
            phone: elements.phone ? elements.phone.value : '',
            timestamp: new Date().toISOString()
        };

        let savedAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        savedAddresses.push(currentAddress);
        localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
        
        alert('地址已保存！');
    }
}

// 初始化地址生成器
new AddressGenerator();
