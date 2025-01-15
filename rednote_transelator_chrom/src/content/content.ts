// 在文件开头添加导出，使其成为模块
export {};

// 添加全局声明
declare global {
  interface Window {
    _translatorLoaded: boolean;
  }
}

function init() {
  console.log('初始化翻译按钮...');
  
  // 创建一个固定的翻译按钮
  const button = document.createElement('button');
  button.textContent = '翻译测试';
  button.id = 'translate-test-button'; // 添加ID便于调试
  button.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 20px;
    background: red;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 2147483647;
    font-size: 14px;
    font-family: Arial, sans-serif;
  `;

  // 直接使用内联事件处理器
  button.setAttribute('onclick', 'alert("按钮被点击了！")');
  
  // 同时也添加事件监听器
  button.addEventListener('click', function(e) {
    console.log('按钮被点击');
    e.preventDefault();
    e.stopPropagation();
    alert('按钮被点击了（addEventListener）！');
  }, true);

  // 添加到页面
  document.body.appendChild(button);
  console.log('翻译按钮已添加到页面');

  // 验证按钮是否正确添加
  setTimeout(() => {
    const addedButton = document.getElementById('translate-test-button');
    if (addedButton) {
      console.log('按钮存在于DOM中');
      // 添加一个直接的点击处理器
      addedButton.onclick = function() {
        alert('按钮被点击了（直接onclick）！');
        return false;
      };
    } else {
      console.error('按钮未找到！');
    }
  }, 1000);
}

// 确保 DOM 加载完成后再初始化
if (document.readyState === 'loading') {
  console.log('等待DOM加载...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM已加载，开始初始化');
    init();
  });
} else {
  console.log('DOM已经加载，直接初始化');
  init();
}

// 添加一些全局错误处理
window.addEventListener('error', function(e) {
  console.error('发生错误：', e.message);
  alert('发生错误：' + e.message);
});

// 设置全局标记
window._translatorLoaded = true;

// 添加一个全局的点击事件监听器
document.addEventListener('click', function(e) {
  console.log('点击事件触发于：', e.target);
}, true); 