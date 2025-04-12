import { serve } from 'https://deno.land/std/http/server.ts';
import { serveFile } from 'https://deno.land/std/http/file_server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { join } from 'https://deno.land/std/path/mod.ts';

// Load environment variables
const env = await Deno.readTextFile('.env');
const envVars = Object.fromEntries(
  env.split('\n')
    .filter((line: string) => line && !line.startsWith('#'))
    .map((line: string) => line.split('='))
);

// Initialize Supabase client
const supabase = createClient(
  envVars.SUPABASE_URL,
  envVars.SUPABASE_ANON_KEY
);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const headers = { 'Content-Type': 'application/json' };

  // API endpoints
  if (url.pathname.startsWith('/api/')) {
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), { headers });
    }

    // Get messages
    if (url.pathname.startsWith('/api/messages/') && req.method === 'GET') {
      const chatId = url.pathname.split('/').pop();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers,
        });
      }

      return new Response(JSON.stringify(data), { headers });
    }

    // Post message
    if (url.pathname === '/api/messages' && req.method === 'POST') {
      const body = await req.json();
      const { chatId, content, userId } = body;

      const { data, error } = await supabase
        .from('messages')
        .insert([{ chat_id: chatId, content, user_id: userId }])
        .select();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers,
        });
      }

      return new Response(JSON.stringify(data), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    });
  }

  // Serve static files
  try {
    const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const fullPath = join(Deno.cwd(), 'src/client', filePath);
    return await serveFile(req, fullPath);
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}

console.log('Server running at http://localhost:3000');
await serve(handler, { port: 3000 });

