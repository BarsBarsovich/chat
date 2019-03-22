const ws = new WebSocket('ws://localhost:5501');
ws.onopen = function () {
    console.log('client connect');
}


const loginButton = document.getElementById('login');

loginButton.addEventListener('click', () => {

    const fio = document.getElementById('fio').value;
    const nick = document.getElementById('username').value;

    document.querySelector('.name').innerText = fio;

    const data = {type: 'login', data: {fio: fio, nick: nick}};
    ws.send(JSON.stringify(data));

    document.querySelector('.chat').style.display = 'flex';
    document.querySelector('.login').style.display = 'none';

});


const sendMessageBtn = document.getElementById('sendMessage');

sendMessageBtn.addEventListener('click', () => {

    const data = {type: 'message', data: {message: document.getElementById('message').value, id: document.getElementById('currentUserId').innerText}};
    ws.send(JSON.stringify(data));
});


ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const currentUserFio = document.querySelector('.name').innerText;

    switch (data.type) {
        case 'allUsers':
            const users = data.data.userOnServer;
            for (const user of users) {

                if (currentUserFio == user.data.nick){
                    document.getElementById('currentUserId').innerText = user.id;
                }
                const name = user.data.nick;
                const userElement = document.createElement('div');
                userElement.innerText = name;
                document.querySelector('.users__list').appendChild(userElement);
            }
            console.log('data', data);
            break;
        case 'newUser':
            const userElement = document.createElement('div');
            userElement.innerText = JSON.parse(data.data.data).data.nick;
            document.querySelector('.users__list').appendChild(userElement);
            break;
        case 'newMessage':
            console.log('condition works');
            break;
    }
}

ws.onclose = function (event) {
    console.log('Server was closed');
}


ws.onerror = function (err) {
    console.log(err);
}
