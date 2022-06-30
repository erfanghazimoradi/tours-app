import axios from 'axios';
import { elementContent, showAlert } from './alerts';
import { baseUrl } from './locationUtils';

const bookTour = async e => {
  const { tourId } = e.target.dataset;

  const stripe = Stripe(
    'pk_test_51LAFP4CjkwMhMwP84v748mSIBWDBQH0ytlZpjnYIIyNxAvCM5xwm2LG2mwtYaVISRvkYY8G0XsUqjVEEWjzoqaKy00vHUwazK2'
  );

  try {
    elementContent('#bookTourBtn', 'loading...');

    const checkoutSession = await axios.get(
      `${baseUrl}/api/bookings/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: checkoutSession.data.data.checkoutSession.id
    });

    elementContent('#bookTourBtn', 'book tour now!');
  } catch (err) {
    showAlert(err.response.data.status, err.response.data.message, 3000);
  } finally {
    elementContent('#bookTourBtn', 'book tour now!');
  }
};

export { bookTour };
