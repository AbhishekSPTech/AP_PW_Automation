# Auth Storage Directory

This directory stores authentication state files generated during test setup.

## Files

- `client.user.json` - Client user authentication state (generated automatically)
- `admin.user.json` - Admin user authentication state (if needed)

## Important

These files are **auto-generated** by the auth setup fixture and should not be committed to version control (they're in .gitignore).

They contain session/cookie information for authenticated users.
