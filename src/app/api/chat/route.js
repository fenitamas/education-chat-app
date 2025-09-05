export async function GET() {
  return new Response(JSON.stringify({ rooms: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
