export async function GET() {
  return Response.json({
    status: "ok",
    service: "mtg-price-tracker",
    timestamp: new Date().toISOString(),
  });
}
