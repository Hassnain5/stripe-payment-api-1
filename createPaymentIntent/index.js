const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function (context, req) {
  context.res = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  };

  if (req.method === "OPTIONS") {
    context.res.status = 204;
    context.done();
    return;
  }

  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      context.res = {
        status: 400,
        body: { error: "Amount and currency are required" }
      };
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true }
    });

    context.res = {
      status: 200,
      body: { clientSecret: paymentIntent.client_secret }
    };
  } catch (error) {
    context.log("Stripe Error:", error);
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};
