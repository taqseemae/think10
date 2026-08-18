import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const rawBody = await request.text();
          const signature = request.headers.get("stripe-signature");

          if (!signature) {
            return new Response("Missing signature", { status: 400 });
          }

          const secret = process.env.STRIPE_WEBHOOK_SECRET;
          if (!secret) {
             console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set in .env");
             return new Response("Internal Server Error", { status: 500 });
          }

          let event: Stripe.Event;
          try {
            event = stripe.webhooks.constructEvent(rawBody, signature, secret);
          } catch (err: any) {
            console.error("[Stripe Webhook] Signature verification failed:", err.message);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
          }

          const db = await getDb();

          if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;
            const uid = metadata?.uid || session.client_reference_id;
            const purchaseType = metadata?.purchaseType;
            
            console.log(`[Stripe Webhook] Processed checkout for user ${uid}, type: ${purchaseType}`);

            if (uid) {
               if (purchaseType === 'zyne_tokens') {
                 // Add 500 Zyne tokens
                 await db.collection("users").updateOne(
                   { uid },
                   { $inc: { zyneTokens: 500 } }
                 );
                 
               } else if (purchaseType === 'credit') {
                 // Add 1 Strategy Session Credit
                 await db.collection("users").updateOne(
                   { uid },
                   { $inc: { credits: 1 } }
                 );
                 // create ledger entry
                 await db.collection("creditsLedger").insertOne({
                   userId: uid,
                   amount: 1,
                   description: "Purchased Strategy Session Credit",
                   status: "Completed",
                   balanceAfter: "Updated", // You might want to query actual balance first in prod
                   timestamp: new Date().toLocaleString()
                 });

               } else if (purchaseType === 'subscription' && metadata?.planRole) {
                 // Upgrade Plan
                 await db.collection("users").updateOne(
                   { uid },
                   { $set: { "plan.role": metadata.planRole, "plan.status": "Active" } }
                 );
               }
            }
          }

          return new Response(JSON.stringify({ received: true }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          });
        } catch (error) {
           console.error("[Stripe Webhook Error]", error);
           return new Response("Internal Server Error", { status: 500 });
        }
      }
    }
  }
});
