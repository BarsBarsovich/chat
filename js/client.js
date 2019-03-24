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

loadImageBtn.addEventListener('click', ()=>{
    document.getElementById('dropZone').style.display= 'block';
    document.getElementById('dropZone').style.opacity= 1;
})



ws.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const currentUserFio = document.querySelector('.name').innerText;

    switch (data.type) {
        case 'allUsers':
            const users = data.data.userOnServer;
            const posts = data.post;
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
        case 'userLogout':
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


ws.onerror = function (err) {
    console.log(err);
}

const dropzoneLabel = document.querySelector('.load-img__dropzone-label');
const loadImgButton = document.querySelectorAll('.load-img__button');


    dropzoneLabel.addEventListener('drop', e => {
        let dt = e.dataTransfer
        let file = dt.files

        previewImage(file[0]).then(base64image => {
            // сохраняем картинку из промиса для того чтобы функция в обработчике могла её использовать
            _base64image = base64image;
            console.log(_base64image)
            loadImgButton[1].classList.remove('load-img__button--inactive');
            loadImgButton[1].addEventListener('click', sendImageToServerWrapper);
        });

        return false;
    });

function previewImage(file) {
    return new Promise((resolve, reject) => {
        if (file.size <= 512 * 1024) {
            // errorAlert.style.opacity = 0;
            renderImage(file).then(base64image => resolve(base64image));
        } else {
            // errorAlert.style.opacity = 1;
            reject();
        }
    })
}

// рендеринг изображения
function renderImage(file) {
    return new Promise((resolve) => {
        let base64image = '';
        var reader = new FileReader();

        reader.onload = function (event) {
            base64image = event.target.result;

            dropzoneLabel.style.backgroundImage = `url(${base64image})`;
            dropzoneLabel.innerText = ''

            resolve(base64image)
        }
        reader.readAsDataURL(file)
    })
}
