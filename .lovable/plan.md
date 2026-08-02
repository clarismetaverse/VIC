## Problem

When you click **Activities**, the preview reloads (Vite HMR / full reload). On reload, `AuthProvider` bootstraps and calls `fetchVicProfile` with the cached token. The Xano token has expired (`"This token is expired."` in the console), `fetchVicProfile` returns `null`, and the provider clears the token and redirects to `/login`. The Activities page itself is fine — it's the bootstrap path that kicks you out.

## Fix

Stop forcing logout when the bootstrap profile fetch fails. Keep the user on the current route, surface a soft "session may be stale" state, and only redirect to `/login` on explicit user-driven login failures or a real 401 returned by a user-triggered call.

### Changes

1. **`src/contexts/AuthProvider.tsx` — bootstrap path**
   - In the `bootstrap` effect, if `hydrateUser(token, true)` returns false (profile fetch failed), do **not** call `setAuthToken(null)` and do **not** `navigate("/login")`.
   - Keep the cached token in `localStorage`, leave `user` as `null` (or optionally a minimal placeholder), and just stop loading.
   - Remove the `navigate("/login", { replace: true })` from the bootstrap `catch` for the same reason.

2. **`src/contexts/AuthProvider.tsx` — `hydrateUser`**
   - Remove the side-effects that clear the token and navigate when `profile` is `null` during bootstrap. Those side-effects belong only to the explicit login flow.
   - Leave the login (`login()`) flow untouched: if `hydrateUser` fails right after `auth_vic_login`, it still throws so the Login screen shows an error.

3. **`src/components/ProtectedRoute.tsx`**
   - Currently it redirects to `/login` whenever `!token || !user`. After the bootstrap change, an expired token will leave `user === null` but `token` still present. Update the guard so it only redirects when there is no token at all. If there is a token but no user yet, render the protected content (the individual API calls inside each page will fail gracefully via `xanoFetch` errors, which the pages already handle with empty states / error logs).

4. **`src/services/index.ts` — unchanged behavior, just confirm**
   - `apiFetch` already dispatches `UNAUTHORIZED_EVENT` on a real 401. That stays as-is so a true 401 from a user-driven action still logs the user out cleanly. `xanoFetch` does not auto-logout, which is what we want for the Activities endpoints.

### Out of scope

- No token refresh logic (Xano doesn't expose one in the current setup).
- No changes to the Activities page, Xano endpoints, or the login UI.
- No changes to `vicLocations.ts` / cover upload flow.

### Result

- Clicking Activities (and any HMR-triggered reload) no longer bounces you to `/login` just because the cached token is old.
- A real 401 from `apiFetch` still logs you out.
- The Login screen still works exactly as before for fresh logins.
