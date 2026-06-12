const Peer = require("simple-peer");
const wrtc = require("@roamhq/wrtc");
const { io } = require("socket.io-client");

const roomId = process.argv[2] || "default-room"; 

const socket = io("http://localhost:3000"); 
let peer = null;

socket.on("connect", () => {
    console.log(`[Сервер] Подключено. Вход в комнату: "${roomId}"`);
    socket.emit("join-room", roomId);
});

socket.on("waiting", () => {
    console.log("[Статус] Вы первый в комнате. Ожидание собеседника...");
});

socket.on("start-webrtc", () => {
    console.log("[Статус] Собеседник зашел! Создаем Инициатора...");
    createPeer(true);
});

socket.on("init-webrtc", (data) => {
    console.log("[Статус] Создаем Приемника...");
    createPeer(data.isInitiator);
});

function createPeer(isInitiator) {
    peer = new Peer({
        initiator: isInitiator,
        trickle: false,
        wrtc: wrtc
    });

    peer.on('signal', data => {
        socket.emit('signal-data', { roomId, data });
    });

    peer.on('connect', () => {
        console.log(`\n==================================================`);
        console.log(`=== ЧАТ АКТИВИРОВАН! Напишите текст и нажмите Enter ===`);
        console.log(`==================================================\n`);
        
        process.stdin.resume(); // Активируем поток ввода
        process.stdin.on('data', data => {
            const message = data.toString().trim();
            if (message) peer.send(message);
        });
    });

    peer.on('data', data => {
        console.log(`Собеседник: ${data.toString()}`);
    });

    peer.on('error', error => console.log(`[Ошибка WebRTC]: ${error}`));
}

socket.on('receive-signal', (data) => {
    if (peer) {
        peer.signal(data);
    }
});
