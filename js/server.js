const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({port: 5501});

// список подключенных пользователей, для отправки им сообщения
const clients = {};

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({posts: [], users: []}).write();

wss.on('connection', function (ws) {
    console.log('connect sever');

    const id = uuidv1();

    ws.on('message', function (data) {
        const message = JSON.parse(data);

        switch (message.type) {
            case 'login':
                const userTable = db.get('users');

                // первое что нужно сделать отдать всех пользователей, кто сейчас на серваке. Включая текущего
                db.get('users').push({id: id, data: {fio: message.data.name, nick: message.data.nick}}).write();

                const userOnServer = db.get('users').value();

                ws.send(JSON.stringify({type: 'allUsers', data: {userOnServer}}));


                // если к нам приходит новый пользователь, то всех надо об этом уведомить и ко всем его добавить
                const userName = message.data.name;
                clients[id] = ws;

                for (const key in clients) {
                    if (clients.hasOwnProperty(key)) {

                        if (key !== id) {
                            clients[key].send(JSON.stringify({type: 'newUser', data: {data}}));
                        }
                    }
                }
                break;
            case 'message':
                // для начала сделаем связку UserId + Post

                const messageText = message.data.message;
                const userId = message.data.id;

                db.get('posts').push({ userId: userId, message: messageText}).write();
                // console.log(messagide)

                // получаем сообщение и отправляем его всем, включая текущего
                ws.send(JSON.stringify({type: 'newMessage', messageText: messageText}));
                break;
            case 'avatar':
                break;
        }
    });

    ws.on('close', function () {
        delete clients[id];
    });
});


