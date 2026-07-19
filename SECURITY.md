# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

To report a security vulnerability, please email security@needlink.app.

Do not report security vulnerabilities through public GitHub issues.

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Security Practices

- All secrets are stored in environment variables, never in code.
- Dependencies are regularly audited.
- Authentication is handled through Supabase Auth.
- HTTP security headers are enforced at the application level.
- API endpoints validate all inputs using Zod schemas.
