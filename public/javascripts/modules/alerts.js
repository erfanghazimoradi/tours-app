const hideAlert = () => {
  const alert = document.querySelector('.alert');

  alert?.parentElement.removeChild(alert);
};

const showAlert = (type, message, timeout = 1 * 1000) =>
  new Promise((resolve, reject) => {
    const status = type === 'success' ? type : 'error';

    hideAlert();

    const markup = `<div class="alert alert--${status}">${message}</div>`;

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

    setTimeout(() => {
      hideAlert();
      resolve();
    }, timeout);
  });

const elementContent = (selector, content) => {
  document.querySelector(selector).textContent = content;
};

export { showAlert, hideAlert, elementContent };
