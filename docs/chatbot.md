# Kevin’s AI assistant

The shared chat popup uses the existing Jekyll site, a separate Cloudflare Worker,
OpenAI, and a private Cloudflare D1 database. Visitors can ask follow-up questions.
Answers use the website’s public content and the optional profile fields.

The homepage’s “Get to know Kevin” call to action opens the popup. Other pages
have a chat icon in the bottom-left corner. The shared markup
lives in `_includes/profile-chat.html`. Closing the popup preserves the current
conversation during the page visit; the header’s “New chat” icon resets it. Escape
while focused in chat or the close button dismisses it and returns focus to its opener.
The compact panel stays at the bottom left without a backdrop, blur, or scroll lock,
so visitors can interact with the page while chatting. The popup animates on opening
and closing. Visitors with reduced motion enabled get immediate transitions.

## Update the information

Edit the existing About, Experience, Skills, and Projects pages as usual. Add
extra visitor-facing information to `_data/chat-profile.json`. Blank fields mean
the assistant has no information and should direct the visitor to Kevin’s email.
Only put information you want visitors to learn in this file.

The backend’s knowledge command reads these files and public contact information
from `_config.yml`. Run it after changes, then redeploy the Worker. Its development
and deployment commands regenerate the bundle automatically. A website deployment
alone does not update the already-deployed Worker’s knowledge.

## Set up the backend

Use Node.js 22.13 or newer. From the repository root:

```powershell
cd backend
npm install
npm run knowledge
npm test
npx wrangler login
npx wrangler d1 create kevin-bai-chat
```

Copy the returned database ID into `backend/wrangler.jsonc`. Configure production
origins for your actual website. Local origins are configured separately in
`.dev.vars` and are not allowed by the production configuration.

Store the OpenAI key using the interactive secret prompt, never in the public
website configuration:

```powershell
npx wrangler secret put OPENAI_API_KEY
npm run db:remote
npm run deploy
```

Set `_data/chat.yml`’s `endpoint` to the deployed Worker URL plus `/chat`, for
example `https://kevin-bai-chat.YOUR-SUBDOMAIN.workers.dev/chat`, and rebuild the
Jekyll site. Keep `source_origin` set to your canonical public website origin,
including during local previews. Until the endpoint is configured, the chat provides a direct email link.
Deploy and check the backend before publishing the configured frontend.

## Run locally

Copy `backend/.dev.vars.example` to `backend/.dev.vars`, and replace the API key
placeholder with your own key. This ignored file also enables the local Jekyll
origins. Then, in the backend directory:

```powershell
Copy-Item .dev.vars.example .dev.vars
# Edit .dev.vars to insert your real API key before starting the Worker.
npm run db:local
npm run dev
```

Temporarily set the public endpoint to `http://localhost:8787/chat` and run
Jekyll on port 4000 using the repository’s normal development instructions.
Restore the production endpoint before publishing the site. Local chats use the
local database; they do not appear in the production review database.

## Review conversations

In your authenticated Cloudflare dashboard, open **Workers & Pages → D1 →
kevin-bai-chat** and use the database console to inspect conversation and message
records. There is no public transcript or administrator endpoint. Review and
export records only through your private Cloudflare account.

List recent conversations:

```sql
SELECT id, datetime(updated_at / 1000, 'unixepoch') AS last_activity
FROM conversations ORDER BY updated_at DESC LIMIT 50;
```

Inspect a selected conversation (replace the example ID):

```sql
SELECT role, content, sources_json, model,
       datetime(created_at / 1000, 'unixepoch') AS sent_at
FROM messages WHERE conversation_id = 'CONVERSATION_ID' ORDER BY id;
```

Delete a conversation manually with `DELETE FROM conversations WHERE id =
'CONVERSATION_ID';`. Message records are deleted by the database’s foreign-key
cascade. Cached response records in `requests` also contain answers; delete those
for the same `conversation_id` when deleting a transcript manually.

The “AI chat · Privacy” disclosure is available below the message field. Conversations are
removed 90 days after their last activity by the Worker’s daily scheduled task.
Starting a new chat resets the browser view; it does not delete stored records.
History exists only in browser memory during that page visit.

Requests to OpenAI use `store: false`. This disables stored Responses API state,
but does not disable OpenAI’s applicable abuse-monitoring retention. See
[OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

## Content safeguards

The assistant stays focused on Kevin’s public professional background, projects,
education, skills, and interests. It uses a warm, respectful, constructive tone.
It does not express or speculate about political views, advocate for parties or
candidates, repeat profanity, insult people, or produce hateful, sexual, violent,
or discriminatory content. Honest questions about role fit, skill gaps, or
weaknesses remain welcome; positivity must not turn into invented achievements.

Server-side safeguards check visitor input before generation and check the
complete proposed answer before it is returned. These combine local filtering,
[OpenAI moderation](https://developers.openai.com/api/docs/guides/moderation),
and a separate structured policy check for topic, tone, and attempts to override
the assistant’s rules. Moderation alone does not enforce the site’s political
neutrality or professional tone.
The backend key must permit both Responses and Moderations API calls. The policy
classifier uses the configured chat model unless `SAFETY_MODEL` is supplied.

Blocked content receives a fixed friendly invitation to ask about Kevin instead.
If a check is unavailable, times out, or returns an invalid result, the backend
returns a fixed safe message. An unchecked draft is never displayed, stored as
an answer, or written to logs. Declined input is stored as a neutral placeholder,
and blocked answers have no source links. Old cached answers and conversation
history from before this policy version cannot bypass the new checks.

Apply the new D1 migration before deploying the updated Worker:

```powershell
npm run db:remote
npm run deploy
```

These layers reduce risk; automated classifiers cannot guarantee perfect
decisions on every phrasing or language. Before enabling production, exercise
real API checks with professional questions and adversarial attempts, including
political opinions, abusive text, prompt injection, and hostile drafts.

## Limits and verification

The default model is `gpt-4.1-mini`, configured in `backend/wrangler.jsonc`.
Messages are limited to 2,000 characters, answers to 600 output tokens, and the
model receives at most ten recent messages. An atomic database counter limits
the backend to 100 admitted chat requests per UTC day; burst protection is separate.
Each allowed exchange also runs separate input and output moderation and policy
checks, so a chat request can make multiple provider calls. Policy checks add
token usage and latency; all stages share the request’s overall time limit.
Retries reuse a request ID so a lost response does not cause duplicate charges.

Check `npm test`, `npm run dry-run`, and a Jekyll build before release.
After configuring credentials, verify a real question about Kevin’s experience,
a follow-up, source links, an unknown availability question, and a role-fit
question. Check Cloudflare’s operational logs for errors and the private database
for the saved conversation. Logs should contain status information, not message
contents or API keys.

For outages, invalid configuration, or daily limits, visitors receive an email
contact option. Use provider billing controls and review usage alongside the
application’s request cap. No secrets or backend code should appear in Jekyll’s
generated output.
