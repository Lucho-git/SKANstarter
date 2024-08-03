import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const sendgridApiKey = Deno.env.get('PRIVATE_SENDGRID_API_KEY')
const activeListId = "42ec54d4-bb96-4d12-b478-0bf9d0c20c11"
const unsubscribedListId = "499f4889-94e6-48b8-98c3-43d795bedd25"

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

async function getContactIdByEmail(email: string): Promise<string | null> {
  console.log(`Searching for contact with email: ${email}`);
  const response = await fetch(`https://api.sendgrid.com/v3/marketing/contacts/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `email = '${email}'`
    })
  });
  console.log(`Search response status: ${response.status}`);
  const responseBody = await response.text();
  console.log(`Search response body: ${responseBody}`);

  if (response.ok) {
    const data = JSON.parse(responseBody);
    if (data.result && data.result.length > 0) {
      return data.result[0].id;
    }
  }
  return null;
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '*'

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(origin) })
  }

  if (req.method === 'POST') {
    const { email, subscriptionStatus } = await req.json()
    console.log(`Updating status for email: ${email} to ${subscriptionStatus}`)

    try {
      let removeListId, addListId;

      if (subscriptionStatus === 'unsubscribe') {
        removeListId = activeListId;
        addListId = unsubscribedListId;
      } else if (subscriptionStatus === 'subscribe') {
        removeListId = unsubscribedListId;
        addListId = activeListId;
      } else {
        throw new Error('Invalid subscription status');
      }

      const contactId = await getContactIdByEmail(email);
      console.log(`Retrieved contact ID: ${contactId}`);
      if (!contactId) {
        throw new Error(`Contact not found for email: ${email}`);
      }

      console.log(`Removing contact from list: ${removeListId}`);
      const removeRequestBody = JSON.stringify({ contact_ids: [contactId] });
      console.log(`Remove request body: ${removeRequestBody}`);

      // Remove from the appropriate list
      const contactIdParam = encodeURIComponent(contactId);
      const removeResponse = await fetch(`https://api.sendgrid.com/v3/marketing/lists/${removeListId}/contacts?contact_ids=${contactIdParam}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      

      console.log(`Remove response status: ${removeResponse.status}`);
      const removeResponseBody = await removeResponse.text();
      console.log(`Remove response body: ${removeResponseBody}`);

      if (!removeResponse.ok) {
        throw new Error(`SendGrid API error (remove): ${removeResponse.status} ${removeResponse.statusText} - ${removeResponseBody}`);
      }

      console.log(`Successfully removed email: ${email} from list: ${removeListId}`);

      // Add to the appropriate list
      const addResponse = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          list_ids: [addListId],
          contacts: [{ email }]
        })
      });

      if (!addResponse.ok) {
        const addErrorBody = await addResponse.text();
        throw new Error(`SendGrid API error (add): ${addResponse.status} ${addResponse.statusText} - ${addErrorBody}`);
      }

      console.log(`Successfully added email: ${email} to list: ${addListId}`);

      return new Response(JSON.stringify({ success: true, message: 'Contact status updated successfully' }), {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error(`Error updating contact status: ${error.message}`);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders(origin) });
});
