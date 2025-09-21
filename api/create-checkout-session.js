import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";
import serverless from "serverless-http";


dotenv.config();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://react-ecommerce-three-inky.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100, // cents
        },
        quantity: item.quantity,
      })),
      success_url: "https://react-ecommerce-three-inky.vercel.app/success",
      cancel_url: "https://react-ecommerce-three-inky.vercel.app/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Payment failed" });
  }
});

export default serverless(app);
