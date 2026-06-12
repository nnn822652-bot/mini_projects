const Peer = require("simple-peer")
const wrtc = require("@roamhq/wrtc")
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const isInitiator = process.argv[2] == "init"

const peer = new Peer({
    initiator: isInitiator,
    trickle: false,
    wrtc: wrtc
});
peer.on('signal', data => {
    console.log(`\n--Скопируйте этот код и отправьте собеседнику--`);
    console.log(JSON.stringify(data));
})
rl.question(`Вставьте код сигнала полученный от собеседника: `, answer => {
    peer.signal(JSON.parse(answer));
});
peer.on('connect', () => {
    console.log(`Успешно подключено`)
    rl.on('line', line => {
        peer.send(line)
    });
});
peer.on('data', data => {
    console.log(`Собеседник:${data.toString()}`)
});
peer.on(`error`, error => console.log(`Ошибка: ${error}`));