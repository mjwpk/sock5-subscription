// ==UserScript==
// @name         Douyin Creator Keep-Alive (Hybrid Mode)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  双重保活：模拟随机鼠标事件 + 发送隐形请求
// @match        https://creator.douyin.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    console.log("[Douyin KeepAlive] 混合保活模式已启动...");

    // ==========================================
    // 策略 1: 模拟前端活跃
    // ==========================================
    
    // 生成一个随机整数
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    // 模拟鼠标移动 (增加随机性，不要老是在 0,0)
    setInterval(() => {
        const x = randomInt(10, 500); // 在屏幕左上角区域随机移动
        const y = randomInt(10, 500);
        
        document.dispatchEvent(
                new MouseEvent("mousemove", {
                    bubbles: true,
                    cancelable: false,
                    view: window,
                    clientX: x,
                    clientY: y,
                })
            );
        }, 300 * 1000); // 调整为 5分钟一次，保持“活跃”状态

    // 模拟键盘 Shift 键 
    setInterval(() => {
        window.dispatchEvent(
            new KeyboardEvent("keydown", {
                bubbles: true,
                cancelable: true,
                key: "Shift",
                code: "ShiftLeft",
                keyCode: 16,
                which: 16,
                shiftKey: true,
            })
        );
        window.dispatchEvent(
            new KeyboardEvent("keyup", {
                bubbles: true,
                cancelable: true,
                key: "Shift",
                code: "ShiftLeft",
                keyCode: 16,
                which: 16,
                shiftKey: true,
            })
        );
    }, 600 * 1000);

 function scheduleNextHeartbeat() {
        // 设定随机范围
        const minSeconds = 15 * 60;
        const maxSeconds = 29 * 60; 
        
        // 计算本次等待的毫秒数
        const nextDelay = randomInt(minSeconds, maxSeconds) * 1000;
        
        console.log(`[后端保活] 下次心跳将在 ${(nextDelay / 60000).toFixed(2)} 分钟后发送`);

        setTimeout(() => {
            // 1. 执行网络请求
            performHeartbeat();
            
            // 2. 递归：请求发送完后，预约下一次（实现无限循环）
            scheduleNextHeartbeat();
            
        }, nextDelay);
    }

    function performHeartbeat() {
        fetch(window.location.href, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'include'
        })
        .then(res => {
            if(res.ok) {
                 console.log(`[后端保活] 服务器响应正常 - ${new Date().toLocaleTimeString()}`);
            } else {
                 console.warn(`[后端保活] 异常状态: ${res.status}`);
            }
        })
        .catch(e => console.error("[后端保活] 网络请求失败", e));
    }

    // 启动第一次心跳循环
    scheduleNextHeartbeat();

    // ==========================================
    // 策略 3: 切回后台时的防休眠
    // ==========================================
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            console.log("[Douyin KeepAlive] 页面被隐藏，发送一次心跳...");
            window.dispatchEvent(new Event("mousemove"));
        }
    });

})();