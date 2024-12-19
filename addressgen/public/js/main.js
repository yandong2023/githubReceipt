document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const batchBtn = document.getElementById('batch-btn');
    const countrySelect = document.getElementById('country');
    const cityInput = document.getElementById('city');
    const resultDiv = document.getElementById('result');
    const batchResultDiv = document.getElementById('batch-result');
    const emailInbox = document.getElementById('email-inbox');
    const emailContent = document.getElementById('email-content');
    
    let currentEmail = '';

    generateBtn.addEventListener('click', async () => {
        const country = countrySelect.value;
        const city = cityInput.value;

        try {
            const response = await fetch('/generate-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ country, city }),
            });

            if (!response.ok) throw new Error('生成地址失败');

            const address = await response.json();
            displayAddress(address);
            resultDiv.classList.remove('hidden');
            batchResultDiv.classList.add('hidden');
            emailInbox.classList.add('hidden');
            emailContent.classList.add('hidden');
        } catch (error) {
            alert(error.message);
        }
    });

    // 处理"查看邮件"按钮点击
    document.querySelector('.check-email-btn').addEventListener('click', async () => {
        const emailInput = document.querySelector('.email');
        currentEmail = emailInput.value;
        
        if (!currentEmail) {
            alert('请先生成一个地址以获取临时邮箱');
            return;
        }

        try {
            await refreshInbox();
            resultDiv.classList.add('hidden');
            emailInbox.classList.remove('hidden');
            emailContent.classList.add('hidden');
        } catch (error) {
            alert('获取邮件失败：' + error.message);
        }
    });

    // 刷新收件箱
    document.getElementById('refresh-inbox').addEventListener('click', refreshInbox);

    // 返回收件箱
    document.getElementById('back-to-inbox').addEventListener('click', () => {
        emailContent.classList.add('hidden');
        emailInbox.classList.remove('hidden');
    });

    // 复制全部按钮
    document.querySelector('.copy-all-btn').addEventListener('click', () => {
        const address = document.querySelector('.street-address').value;
        const city = document.querySelector('.city').value;
        const stateZip = document.querySelector('.state-zip').value;
        const phone = document.querySelector('.phone').value;
        const email = document.querySelector('.email').value;

        const fullAddress = `${address}\n${city}\n${stateZip}\n${phone}\n${email}`;
        
        navigator.clipboard.writeText(fullAddress).then(() => {
            alert('已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败');
        });
    });

    async function refreshInbox() {
        try {
            const response = await fetch(`/check-email?email=${encodeURIComponent(currentEmail)}`);
            if (!response.ok) throw new Error('获取邮件失败');
            
            const emails = await response.json();
            displayEmails(emails);
        } catch (error) {
            alert('刷新收件箱失败：' + error.message);
        }
    }

    function displayEmails(emails) {
        const emailList = document.getElementById('email-list');
        emailList.innerHTML = '';

        emails.forEach(email => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(email.from)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${escapeHtml(email.subject)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(email.date).toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="text-blue-500 hover:text-blue-700" onclick="viewEmail('${email.id}')">
                        查看
                    </button>
                </td>
            `;
            emailList.appendChild(row);
        });
    }

    window.viewEmail = async (emailId) => {
        try {
            const response = await fetch(`/view-email?id=${emailId}`);
            if (!response.ok) throw new Error('获取邮件内容失败');
            
            const email = await response.json();
            
            document.getElementById('email-subject').textContent = email.subject;
            document.getElementById('email-from').textContent = email.from;
            document.getElementById('email-date').textContent = new Date(email.date).toLocaleString();
            document.getElementById('email-body').innerHTML = email.html || email.text;
            
            emailInbox.classList.add('hidden');
            emailContent.classList.remove('hidden');
        } catch (error) {
            alert('查看邮件失败：' + error.message);
        }
    };

    function displayAddress(address) {
        document.querySelector('.street-address').value = `${address.streetNumber} ${address.street}`;
        document.querySelector('.city').value = address.city;
        document.querySelector('.state-zip').value = address.state ? 
            `${address.state}, ${address.zipCode}` : 
            address.postCode;
        document.querySelector('.phone').value = address.phoneNumber;
        document.querySelector('.email').value = address.email;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 批量生成地址
    batchBtn.addEventListener('click', async () => {
        try {
            const count = prompt('请输入要生成的地址数量 (1-100):', '10');
            if (!count) return;

            const country = countrySelect.value;
            const response = await fetch(`/api/address/batch/${country}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ count: parseInt(count) })
            });

            const data = await response.json();

            if (response.ok) {
                displayBatchAddresses(data.addresses);
                batchResultDiv.classList.remove('hidden');
                resultDiv.classList.add('hidden');
                emailInbox.classList.add('hidden');
                emailContent.classList.add('hidden');
            } else {
                alert(data.error || '生成地址失败');
            }
        } catch (error) {
            console.error('批量生成地址时出错:', error);
            alert('生成地址失败，请重试');
        }
    });

    // 显示批量生成的地址
    function displayBatchAddresses(addresses) {
        const tbody = document.getElementById('batch-table-body');
        tbody.innerHTML = '';

        addresses.forEach(address => {
            const tr = document.createElement('tr');
            
            const streetTd = document.createElement('td');
            streetTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            streetTd.textContent = `${address.streetNumber} ${address.street}`;

            const cityTd = document.createElement('td');
            cityTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            cityTd.textContent = address.city;

            const stateZipTd = document.createElement('td');
            stateZipTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            stateZipTd.textContent = address.country === 'United States' 
                ? `${address.state} ${address.zipCode}`
                : address.postCode;

            const phoneTd = document.createElement('td');
            phoneTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            phoneTd.textContent = address.phoneNumber;

            const emailTd = document.createElement('td');
            emailTd.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
            emailTd.textContent = address.email;

            tr.appendChild(streetTd);
            tr.appendChild(cityTd);
            tr.appendChild(stateZipTd);
            tr.appendChild(phoneTd);
            tr.appendChild(emailTd);

            tbody.appendChild(tr);
        });
    }

    // 下载CSV文件
    document.getElementById('download-csv').addEventListener('click', () => {
        const headers = ['Street Address', 'City', 'State/Postal Code', 'Phone Number', 'Email'];
        const rows = [];
        const tbody = document.getElementById('batch-table-body');
        const trs = tbody.children;
        for (let i = 0; i < trs.length; i++) {
            const tr = trs[i];
            const tds = tr.children;
            const row = [];
            for (let j = 0; j < tds.length; j++) {
                row.push(tds[j].textContent);
            }
            rows.push(row);
        }

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'addresses.csv';
        link.click();
    });
});
