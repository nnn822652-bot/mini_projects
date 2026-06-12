const { Server } = require("socket.io");

const io = new Server(3000, { cors: { origin: "*" } });

console.log(" Сигнальный сервер запущен на порту 3000...");

io.on("connection", (socket) => {
    socket.on("join-room", async (roomId) => {
        await socket.join(roomId);
        const sockets = await io.in(roomId).fetchSockets();
        const numClients = sockets.length;

        console.log(`[Комната ${roomId}] Подключено участников: ${numClients}`);

        if (numClients === 1) {
            socket.emit("waiting");
        } else if (numClients === 2) {
            socket.to(roomId).emit("start-webrtc");
            socket.emit("init-webrtc", { isInitiator: false });
        }
    });

    socket.on("signal-data", (payload) => {
        socket.to(payload.roomId).emit("receive-signal", payload.data);
    });
});
