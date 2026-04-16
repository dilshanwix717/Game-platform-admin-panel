# Deployment (e.g. Alicloud / Kubernetes)

## Required environment variables in production

Set these in your Alicloud/Kubernetes deployment (ConfigMap, Secret, or pod env):

| Variable | Description |
|----------|-------------|
| **NEXTAUTH_URL** | Full public URL of this app, e.g. `https://admin.yourdomain.com`. Required by NextAuth for callbacks and to avoid runtime errors. |
| **NEXTAUTH_SECRET** | Secret for signing JWTs/sessions. Use a long random string. |
| **API_BASE_URL** | Backend API base URL (no trailing slash), e.g. `http://your-backend:3000`. |

If **NEXTAUTH_URL** is not set, you may see:

- `[next-auth][warn][NEXTAUTH_URL]` in logs
- `TypeError: Cannot read properties of undefined (reading 'aa')` (from NextAuth internals when URL is missing)

## Health checks

- The image includes **curl** so K8s probes like `curl -f http://localhost:3000` work.
- Alternatively use an exec probe with Node:  
  `node -e "require('http').get('http://localhost:3000', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"`

## JSON and backend response

- If the backend login API returns non-JSON or invalid JSON (e.g. HTML error page or bad escape sequences), the app now handles it safely and logs instead of crashing with `SyntaxError: Bad escaped character in JSON`.
- Ensure your auth backend at `API_BASE_URL/v1/auth/login` returns valid JSON with `access_token` and `refresh_token`.
