const WebSocket = require('ws');
const fs = require('fs');
const uuidv1 = require('uuid/v1');

const wss = new WebSocket.Server({port: 5501});

// список подключенных пользователей, для отправки им сообщения
const clients = {};

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({posts: [], users: [], avatars:[]}).write();

wss.on('connection', function (ws) {
    console.log('connect sever');

    const id = uuidv1();

    ws.on('message', function (data) {
        const message = JSON.parse(data);

        switch (message.type) {
            case 'login':
                const userTable = db.get('users');
                const userOnServer = userTable.value();

                // если у нас такой пользователь уже был, то его надо сделать активным и отдать все его данные
                let previousId;

                for (let item of userOnServer){
                    if (item.data.nick === message.data.nick) {
                        console.log('condition done');
                        previousId =  item.id;
                    }
                }

                if (previousId) {
                    userTable.find({id: previousId}).assign({status: 'active'}).write();
                    const allPosts = db.get('posts').value();

                    for (let i = 0; i < allPosts.length; i++){
                        if (allPosts[i].userId !== previousId){
                            allPosts.splice(i,1);
                        }
                    }
                    ws.send(JSON.stringify({type: 'allUsers', data: {userOnServer}, post: {allPosts}}));
                    return;
                } else {
                    // первое что нужно сделать отдать всех пользователей, кто сейчас на серваке. Включая текущего
                    db.get('users').push({id: id, data: {fio: message.data.name, nick: message.data.nick}}).write();
                }

                // из нашаго списка удалим неактивных
                for (let i = 0; i < userOnServer.length; i++) {
                    if (userOnServer[i].status === 'unactive') {
                        userOnServer.splice(i, 1);
                    }
                }

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

                db.get('posts').push({userId: userId, message: messageText}).write();
                // console.log(messagide)

                for (const key in clients) {
                    clients[key].send(JSON.stringify({type: 'newMessage', messageText: messageText}))
                }

                // получаем сообщение и отправляем его всем, включая текущего
                // ws.send(JSON.stringify({type: 'newMessage', messageText: messageText}));
                break;
            case 'avatar':
                console.log(message);
                fs.writeFile(`./uploads/1.png`, message.data);
                clients[id].send(JSON.stringify({type: 'upload', data:{}}))
                break;
        }
    });

    ws.on('close', function () {
        delete clients[id];
        // в нашей таблице надо сделать пользователя неактивным и обновить всех клиентов
        db.get('users').find({id: id}).assign({status: 'unactive'}).write();
    });
});


