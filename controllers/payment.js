import stripe from 'stripe';

import { buffer } from 'micro';

import User from '../models/user.js';

export const cancelPayment = async (req, res) => {
  try {
    const stripeInstance = stripe(process.env.STRIPE_API_KEY);

    const user = await User.findById(req.body.userId)

    const subscriptions = await stripeInstance.subscriptions.list({
      customer: String(user._id)
    });

    await stripeInstance.subscriptions.cancel(subscriptions.data[0].id);

    user.tier = 'Free Plan'
    await user.save()

    res.status(200).json()

  } catch (error) {
    res.status(404).json({ message: error.message })

  }
}

export const payment = async (req, res) => {
  try {

    // const id = req.params.id;
    const stripeInstance = stripe(process.env.STRIPE_API_KEY);

    const user = await User.findById(req.body.userId)

    const customerList = await stripeInstance.customers.list();

    let customer

    if (!customerList.data.find(customer => customer.id == req.body.userId)) {
      customer = await stripeInstance.customers.create({
        id: req.body.userId,
        name: user.name,
        email: user.email
      });
    } else {
      customer = await stripeInstance.customers.retrieve(
        req.body.userId
      );
    }

    let session;


    // Customer doesn't have an existing subscription, create a new one
    session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: req.body.priceId,
          quantity: req.body.quantity,
        },
      ],
      success_url: `${process.env.CLIENT_URL}`,
      cancel_url: `${process.env.CLIENT_URL}`,
      customer: customer.id,
    });

    res.status(200).json({ url: session.url })

  } catch (err) {
    res.status(404).json({ message: err.message })
  }
}

export const getProductAndPrice = async (req, res) => {
  try {
    const { id, price } = req.query


    const stripeInstance = stripe(process.env.STRIPE_API_KEY);
    // const customer = await User.findById(id);
    // await createCustomer(customer, stripeInstance)
    const product = await stripeInstance.products.retrieve(id);

    const prices = await stripeInstance.prices.list({
      product: id,
    });

    const productPrice = await stripeInstance.prices.retrieve(
      req.body.priceId
    );

    res.status(200).json({ product: product, price: productPrice })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }

}

export const clientSecret = async (req, res) => {
  try {
    const stripeInstance = stripe(process.env.STRIPE_API_KEY);
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: 1099,
      currency: 'sek',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({ client_secret: paymentIntent.client_secret })
  } catch (err) {
    res.status(404).json({ message: err.message })
  }

}

const createCustomer = async (params, stripeInstance) => {

  try {
    const customer = await stripeInstance.customers.create({
      email: params.email,
      name: params.name,
    }, function (err, customer) {
      if (customer) {
        console.log('Success')
      } else (
        console.log(err)
      )
    });
  } catch (err) {
    console.log(err)
  }
}