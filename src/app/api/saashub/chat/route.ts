import { NextRequest, NextResponse } from 'next/server';

// Define the expected request body structure
interface ChatRequestBody {
  message: string;
  sessionId: string;
}

// Define the expected response body structure from this API route
interface ChatResponseBody {
  reply?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequestBody;
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId in request body' }, { status: 400 });
    }

    // --- n8n Webhook Call ---
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL is not set in environment variables.');
      return NextResponse.json({ error: 'N8N webhook URL not configured on the server' }, { status: 500 });
    }

    console.log(`API Route: Forwarding message to n8n: ${n8nWebhookUrl}`);
    let assistantReply: string | undefined;

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }), // n8n webhook expects 'message' and 'sessionId'
      });

      if (!n8nResponse.ok) {
        let n8nErrorText = 'Failed to process message via n8n';
        try {
            const n8nErrorData = await n8nResponse.json() as { error?: string, message?: string };
            n8nErrorText = n8nErrorData?.error || n8nErrorData?.message || `n8n returned status ${n8nResponse.status}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
            n8nErrorText = `n8n returned status ${n8nResponse.status} and non-JSON error response.`;
        }
        console.error('Error from n8n:', n8nErrorText);
        return NextResponse.json({ error: n8nErrorText }, { status: n8nResponse.status });
      }

      // Assuming n8n workflow returns a JSON object with a "reply" field
      const n8nData = await n8nResponse.json() as { reply?: string };
      assistantReply = n8nData.reply;

      if (typeof assistantReply !== 'string') {
        console.error('Invalid or missing "reply" field in n8n response:', n8nData);
        return NextResponse.json({ error: 'Invalid response format from n8n workflow' }, { status: 500 });
      }

    } catch (e) {
      console.error('Failed to call n8n webhook:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown error connecting to n8n.';
      return NextResponse.json({ error: `Failed to connect to n8n: ${errorMessage}` }, { status: 503 }); // Service Unavailable
    }
    // --- End n8n Webhook Call ---

    if (!assistantReply) { // This check might be redundant due to the one above, but good for safety.
        return NextResponse.json({ error: 'No valid reply received from assistant after n8n call' }, { status: 500 });
    }

    return NextResponse.json({ reply: assistantReply } as ChatResponseBody, { status: 200 });

  } catch (error) {
    console.error('Error in /api/saashub/chat:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid JSON in request body.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage } as ChatResponseBody, { status: 500 });
  }
}