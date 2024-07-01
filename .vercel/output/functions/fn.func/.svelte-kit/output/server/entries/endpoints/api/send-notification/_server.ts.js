import { j as json } from "../../../../chunks/index.js";
import webpush from "web-push";
import { P as PRIVATE_VAPID_KEY } from "../../../../chunks/private.js";
import { P as PUBLIC_VAPID_KEY } from "../../../../chunks/public.js";
async function POST({ request }) {
  const { subscription, title, body } = await request.json();
  console.log("Sending push notification serverside...");
  webpush.setVapidDetails(
    "mailto:lachie@skanfarming.com",
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
  );
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    return json({ success: true });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
export {
  POST
};
