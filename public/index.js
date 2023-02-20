import {Menu, MENU_RENDER_TYPES} from './components/Menu/Menu.js';
import {safe} from './utils/safe.js';

const rootElement = document.getElementById('root');
const menuElement = document.createElement('aside');
const contentElement = document.createElement('main');
rootElement.appendChild(menuElement);
rootElement.appendChild(contentElement)


const config = {
    feed: {
        name: 'Лента',
        href: '/feed',
        render: renderFeed,
        key: 'feed',

    },
    login: {
        name: 'Авторизация',
        href: '/login',
        render: renderLogin,
        key: 'login',
    },
    signup: {
        name: 'Регистрация',
        href: '/signup',
        render: renderSignup,
        key: 'signup',
    },
    profile: {
        name: 'Профиль',
        href: '/profile',
        render: renderProfile,
        key: 'profile',
    },
    // Для ознакомления!
    // danger: {
    //     name: safe(`Опасность <iframe src="https://example.com" onload="alert('Упс, сайт взломали!')"></iframe>`),
    //     href: '/',
    //     render: () => {},
    //     key: 'danger',
    // }
};

function renderFeed(parent) {
    const feedElement = document.createElement('div');

    Ajax.get({
        url: '/feed',
        callback: (status, responseString) => {
            let isAuthorized = false;

            if (status === 200) {
                isAuthorized = true;
            }

            if (!isAuthorized) {
                alert('Нет авторизации!');
                goToPage(config.login);
                return;
            }

            const images = JSON.parse(responseString);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                feedElement.appendChild(div);

                images.forEach(({src, likes}) => {
                    div.innerHTML += `<img src="${src}" width="500" /><div>${likes} лайков</div>`;
                });
            }
        }
    })

    parent.appendChild(feedElement);
}

function renderLogin(parent) {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Войти!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        Ajax.post({
            url: '/login',
            body: {email, password},
            callback: status => {
                if (status === 200) {
                    goToPage(config.profile);
                    return;
                }

                alert('Неверный емейл или пароль');
            }
        })
    });

    parent.appendChild(form);
}

function renderSignup(parent) {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');
    const ageInput = createInput('number', 'Возраст', 'age');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Зарегестрироваться!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(ageInput);
    form.appendChild(submitBtn);

    parent.appendChild(form);
}

function createInput(type, text, name) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = text;

    return input;
}

function renderMenu(parent) {
    const menu = new Menu(parent);
    menu.config = config;
    menu.render(MENU_RENDER_TYPES.STRING);
}

function renderProfile(parent) {
    const profileElement = document.createElement('div');

    Ajax.get({
        url: '/me',
        callback: (status, responseString) => {
            let isAuthorized = false;

            if (status === 200) {
                isAuthorized = true;
            }

            if (!isAuthorized) {
                alert('Нет авторизации!');
                goToPage(config.login);
                return;
            }

            const {age, email, images} = JSON.parse(responseString);
            const span = document.createElement('span');
            span.textContent = `${email}, ${age} лет`;
            profileElement.appendChild(span);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                profileElement.appendChild(div);

                images.forEach(({src, likes}) => {
                    div.innerHTML += `<img src="${src}" width="500" /><div>${likes} лайков</div>`;
                });
            }
        }
    })

    parent.appendChild(profileElement);
}

function goToPage(configSection) {
    const el = document.querySelector(`[data-section="${configSection.key}"]`)
    if (el.classList.contains('active')) {
        return;
    }

    contentElement.innerHTML = '';

    document.querySelector('.active').classList.remove('active');
    el.classList.add('active');

    configSection.render(contentElement);
}

menuElement.addEventListener('click', (e) => {
    if (e.target instanceof HTMLAnchorElement) {
        e.preventDefault();
        const {section} = e.target.dataset;

        goToPage(config[section])
    }
});

renderMenu(menuElement);
renderFeed(contentElement);
