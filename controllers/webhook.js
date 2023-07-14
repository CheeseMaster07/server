import stripe from 'stripe';
import { buffer } from 'micro';
import nodemailer from 'nodemailer';

import User from '../models/user.js';

export const webhook = async (req, res) => {
  try {
    const stripeInstance = stripe(process.env.STRIPE_API_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      // console.log(req.body)
      const buf = await buffer(req);
      // console.log(buf)

      const rawBody = buf.toString();

      event = stripeInstance.webhooks.constructEvent(rawBody, sig, 'whsec_QUC6QI1zSCnQI5ReaClpz9EL1mly77ul');
    } catch (err) {
      console.log(err);
      return;
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object;

        const user = await User.findOne({ email: session.customer_details.email });
        const subscription = await stripeInstance.subscriptions.retrieve(
          session.subscription
        );

        const product = await stripeInstance.products.retrieve(
          subscription.items.data[0].plan.product
        );

        const subscriptions = await stripeInstance.subscriptions.list({
          customer: String(user._id)
        });

        if (subscriptions.data.length > 1) {
          await stripeInstance.subscriptions.cancel(subscriptions.data[subscriptions.data.length - 1].id);
        }

        user.tier = product.name
        await user.save()

        //mail(user.email)
      } catch (err) {
        console.log(err)
      }

    } else {
      console.log('nah');
    }

    res.sendStatus(200);

  } catch (err) {
    console.log(err);
  }
};

const mail = (email) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  // Set up email data
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Hello from Node.js',
    text: 'This is a test email sent from Node.js using Nodemailer.'
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email sent to: ', email);
    }
  });
}