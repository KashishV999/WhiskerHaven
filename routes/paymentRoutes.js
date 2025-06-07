const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

// Route to render the donation page
router.get("/donate", (req, res) => {
  res.render("donate.ejs");
});

// Route to create a Stripe checkout session
router.post("/create-checkout-session", async (req, res) => {
  const amount = req.body.amount; // Amount in cents
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: "Donation",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/success.html`,
      cancel_url: `${req.protocol}://${req.get("host")}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;