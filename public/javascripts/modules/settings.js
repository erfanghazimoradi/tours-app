import axios from 'axios';
import { showAlert } from './alerts';
import { baseUrl } from './locationUtils';

const editAccount = async e => {
  e.preventDefault();

  const data = new FormData();
  const userAvatar = document.getElementById('avatar').files[0];

  data.append('firstname', document.getElementById('firstname').value);
  data.append('lastname', document.getElementById('lastname').value);
  data.append('gender', document.getElementById('gender').value);
  data.append('email', document.getElementById('email').value);

  if (!!userAvatar) data.append('avatar', userAvatar);

  try {
    const response = await axios.patch(`${baseUrl}/api/users/account`, data);

    if (response.data.status === 'success') {
      await showAlert(response.data.status, 'Settings updated successfully');
      location.reload(true);
    }
  } catch (err) {
    console.log(err.response.data);
    showAlert(err.response.data.status, err.response.data.message, 3000);
  }
};

const deactiveAccount = async () => {
  try {
    const response = await axios.put(`${baseUrl}/api/users/account`);

    if (response.data.status === 'success') {
      await showAlert(response.data.status, 'Your account deactivate successfully');

      location.reload(true);
      location.href = `${baseUrl}/`;
    }
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  }
};

const deleteAccount = async () => {
  try {
    const response = await axios.delete(`${baseUrl}/api/users/account`);

    if (response.status === 204) {
      await showAlert('success', 'Your account deleted successfully');

      location.reload(true);
      location.href = `${baseUrl}/`;
    }
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  }
};

export { editAccount, deactiveAccount, deleteAccount };
