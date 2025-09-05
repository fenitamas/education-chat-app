export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
