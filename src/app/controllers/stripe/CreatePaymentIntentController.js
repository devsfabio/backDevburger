import Stripe from 'stripe';
import * as Yup from 'yup';

const stripe = new Stripe(
  'sk_test_51Q6JiwLNrGdeCSVpoNGe2hAK0a5kF85bMaxa2tkFYOLuUBxLdJKx8V7xvdi2cxyXmGFFJFdex6FmThySkEFDqugF00NBnWn0tP',
);

const calculateOrderAmount = (itens) => {
  const total = itens.reduce((acc, curr) => {
    return curr.price * curr.quantity + acc;
  }, 0);
  return total;
};

class CreatePaymentIntentController {
  async store(request, response) {
    const schema = Yup.object().shape({
      products: Yup.array()
        .required()
        .of(
          Yup.object({
            id: Yup.number().required(),
            quantity: Yup.number().required(),
            price: Yup.number().required(),
          }),
        ),
    });

    try {
      schema.validateSync(request.body, { abortEarly: false });
    } catch (error) {
      return response.status(400).json({ error: error.errors });
    }
    const { products } = request.body;
    const amount = calculateOrderAmount(products);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    response.json({
      clientSecret: paymentIntent.client_secret,
      dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
  }
}

export default new CreatePaymentIntentController();
