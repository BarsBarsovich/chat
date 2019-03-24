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

    const data = {
        type: 'message', data: {
            message: document.getElementById('message').value,
            id: document.getElementById('currentUserId').innerText
        }
    };
    ws.send(JSON.stringify(data));
});

const loadImageBtn = document.getElementById('loadImage');

loadImageBtn.addEventListener('click', () => {
    document.getElementById('uploader').style.display = 'flex';
})


ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const currentUserFio = document.querySelector('.name').innerText;

    switch (data.type) {
        case 'allUsers':
            const users = data.data.userOnServer;
            const posts = data.post;
            const avatar = data.avatar;
            for (const user of users) {

                if (currentUserFio == user.data.nick) {
                    document.getElementById('currentUserId').innerText = user.id;
                    const postsArea = document.querySelector('.message__list');
                    if (posts !== undefined && posts.allPosts !== undefined) {
                        for (let post of posts.allPosts) {
                            console.log('getPOsts');
                            const userPost = document.createElement('div');
                            userPost.innerText = post.message;
                            postsArea.appendChild(userPost);
                        }
                    }
                    if (avatar !== null && avatar !== undefined){
                        console.log(avatar);
                        document.getElementById('loadImage').setAttribute('src',avatar.avatar.avatar);
                    }
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
            console.log(data);
            const mList = document.querySelector('.message__list')
            const newElement = document.createElement('div')
            newElement.innerText = data.messageText;
            mList.appendChild(newElement);
            break;
        case 'SUCCESS':
            const oldImage = document.getElementById('uploadedAvatar').src;
            document.getElementById('uploader').style.display = 'none';
            document.getElementById('loadImage').src = oldImage;
            document.getElementById('uploadedAvatar').src = null;
            break;
    }
}

ws.onclose = function (event) {
    data = {
        type: 'clientClose',
        id: document.getElementById('currentUserId').innerText

    }
    ws.send(JSON.stringify(data))
}

const upload = document.getElementById('uploadAvatar');
upload.addEventListener('click', () => {

    const dataSrc = document.getElementById('uploadedAvatar').src;
    const userId = document.getElementById('currentUserId').innerText
    ws.send(JSON.stringify({type: 'avatar', data: dataSrc, id: userId}))

})


ws.onerror = function (err) {
    console.log(err);
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    getBase64(files[0]).then(
        data => {
            document.getElementById('uploadedAvatar').src = data;
            console.log(data)
        }
    );
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

// Setup the dnd listeners.
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);