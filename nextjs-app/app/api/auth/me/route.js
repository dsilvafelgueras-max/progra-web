import { getUserFromRequest, unauthorized } from '../../../../lib/auth';

// GET /api/auth/me
// Header: Authorization: Bearer <access_token>
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) return unauthorized();

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name,
  });
}
