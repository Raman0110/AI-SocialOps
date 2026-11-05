# Connecting a real Instagram account

SocialOps receives DMs through a Meta webhook and replies through the Instagram messaging API.
Until this is configured the app runs on the sandbox: a fake webhook endpoint and a sender that
only pretends to send. The details below follow Meta's Instagram messaging API; Meta changes
products, permission names and screens often, so check them against Meta's current documentation
while you set this up.

## What you need

- An Instagram **professional** (business or creator) account.
- A Meta developer app with Instagram messaging access, with the Instagram account added to it.
  In development mode this works for accounts that have a role on your app (you and any testers
  you add). Anyone else needs Meta's app review (and usually business verification), which is the
  slow part, so apply early.
- A public **HTTPS** URL for the API. For local testing use a tunnel such as ngrok or
  cloudflared pointing at `http://localhost:8080`.

## 1. Register the account in SocialOps

Create a social account (Social Accounts page or `POST /api/social-accounts`) with
platform `Instagram` and **`externalAccountId` set to the Instagram business account id** (the id
Meta shows for the account, not the @username). Webhook messages are matched to the organization
through this value.

## 2. Configure the API

Set these as environment variables (never commit them):

| Setting | Meaning |
| --- | --- |
| `Instagram__AppSecret` | Your Meta app secret. Used to verify the signature on every webhook delivery. |
| `Instagram__VerifyToken` | Any random string you invent; you enter the same one in Meta's dashboard. |
| `Instagram__AccessTokens__<accountId>` | Access token for that Instagram account, used to send replies. |
| `Instagram__GraphApiVersion` | Optional. Defaults to `v21.0`. |

With docker compose, put `INSTAGRAM_APP_SECRET`, `INSTAGRAM_VERIFY_TOKEN`, `INSTAGRAM_ACCOUNT_ID`
and `INSTAGRAM_ACCESS_TOKEN` in `.env`.

Behavior depends on what is set:

- App secret and verify token set: the real webhook accepts signed deliveries.
- At least one access token set: replies are sent to Instagram. The sandbox sender is then disabled.
- Neither: everything stays on the sandbox in Development; elsewhere replies are recorded as `Failed`
  with "not configured" rather than pretending they were sent.

## 3. Subscribe the webhook in Meta's dashboard

- Callback URL: `https://<your-public-host>/api/webhooks/instagram`
- Verify token: the value of `Instagram__VerifyToken`
- Subscribe to the **messages** field.

Meta sends a GET request with a challenge; the API answers it when the token matches. After that,
every delivery is a POST signed with `X-Hub-Signature-256`. Unsigned or wrongly signed requests are
rejected with 401 and nothing is stored.

## 4. Try it

Send a DM to the connected account from another Instagram account that has a role on your app. It
should appear in the inbox. Reply from the inbox and check the delivery status on the message.

## Behavior to know about

- Only plain text messages from customers are stored. Attachments-only messages, reactions, read
  receipts and echoes of your own replies are ignored.
- The webhook only carries the customer's scoped id, so the customer shows up under that id instead of
  their @username for now.
- Instagram limits text messages to 1000 bytes and generally only lets you reply within 24 hours of the
  customer's last message. Rejections show up as `Failed` with Meta's reason, and can be retried.
- Access tokens expire. An expired token produces a `Failed` message that says to reconnect the account.
  Tokens currently live in configuration; moving them into the database (encrypted, with refresh) is the
  next step once more than one account is connected.
