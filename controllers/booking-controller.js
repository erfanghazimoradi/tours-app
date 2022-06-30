const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tour-model');
const { catchAsync } = require('../utils/catchAsync');

const getCheckoutSession = catchAsync(async (request, response, next) => {
  const baseUrl = `${request.protocol}://${request.get('host')}`;

  const { tourID } = request.params;

  const tour = await Tour.findById(tourID);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: request.user.email,
    client_reference_id: tourID,
    success_url: `${baseUrl}/tours`,
    cancel_url: `${baseUrl}/tours/${tour.slugname}`,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  response.status(200).json({
    status: 'success',
    data: { checkoutSession }
  });
});

module.exports = { getCheckoutSession };
