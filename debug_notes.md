# Debug Notes

## Status Check 2026-04-08T16:39
- Server running OK
- TypeScript: No errors
- LSP: No errors
- Screenshot shows login page (Brasília Cidade Parque)
- Login page has: Email, Senha, Entrar button
- Personas: Visitante, Equipe, Coordenador, Superadmin
- All use password: senha123

## Previous Error
- Estrategia.tsx had "Identifier 'usePageTransition' has already been declared" error
- But checking the file shows only ONE import of usePageTransition
- The error might have been from a stale Vite cache
- After server restart, TypeScript shows NO errors

## Current Issues to Fix
- Instagram API errors when credentials not configured properly
- Need to verify the Instagram router is returning data correctly
