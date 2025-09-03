# Common Errors & Solutions

## 🔴 Authentication Errors

### Error: "Failed to fetch consultation rooms: 401"
**Cause:** User session expired or not authenticated
**Solution:**
1. Clear browser cookies
2. Sign out and sign back in
3. Check if NEXTAUTH_URL matches your current URL
4. Verify JWT token hasn't expired

### Error: "[next-auth]: `useSession` must be wrapped in a <SessionProvider />"
**Cause:** Missing SessionProvider in component tree
**Solution:**
1. Ensure `layout.tsx` includes SessionProvider
2. Wrap app with SessionProvider component
3. Import from correct path: `@/components/providers/session-provider`

### Error: "Access blocked: Authorization Error - OAuth client not found"
**Cause:** Invalid or missing OAuth credentials
**Solution:**
1. Check Google/GitHub OAuth credentials in `.env.local`
2. Verify redirect URIs match exactly
3. Ensure OAuth app is not in test mode
4. Replace placeholder values with real credentials

## 🗄️ Database Errors

### Error: "P1000: Authentication failed against database server"
**Cause:** Wrong database credentials or server not running
**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker restart vidibemus-postgres

# Verify credentials match .env.local
docker exec -it vidibemus-postgres psql -U vidibemus
```

### Error: "P2022: The column `roomType` does not exist"
**Cause:** Database schema mismatch
**Solution:**
```bash
# Reset and migrate database
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### Error: "Can't reach database server"
**Cause:** Database not running or wrong connection string
**Solution:**
1. Start Docker Desktop
2. Run: `docker start vidibemus-postgres`
3. Check DATABASE_URL in `.env.local`
4. Ensure port 5432 is not blocked

## 🌐 Network & API Errors

### Error: "Module not found: Can't resolve '@/utils/format'"
**Cause:** Missing or incorrect import paths
**Solution:**
1. Check if file exists at path
2. Verify tsconfig.json path aliases
3. Clear Next.js cache: `rm -rf .next`
4. Restart dev server

### Error: "Port 3000 is already in use"
**Cause:** Another process using the port
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3000
kill -9 [PID]

# Or use different port
PORT=3001 npm run dev
```

### Error: "ECONNREFUSED 127.0.0.1:3000"
**Cause:** Development server not running
**Solution:**
1. Start server: `npm run dev`
2. Wait for "Ready" message
3. Check correct port in browser

## 🎨 UI/Component Errors

### Error: "Hydration failed because initial UI does not match"
**Cause:** Server and client render mismatch
**Solution:**
1. Check for browser-only code in server components
2. Use `useEffect` for client-only operations
3. Add `suppressHydrationWarning` to dynamic content
4. Ensure consistent date/time rendering

### Error: "Invalid hook call. Hooks can only be called inside function components"
**Cause:** Using hooks incorrectly
**Solution:**
1. Only use hooks in React components
2. Check for duplicate React versions
3. Ensure components are properly exported
4. Run: `npm dedupe`

### Error: "Cannot read properties of undefined"
**Cause:** Accessing undefined object properties
**Solution:**
1. Add null checks: `object?.property`
2. Provide default values: `|| defaultValue`
3. Check API response structure
4. Verify data is loaded before rendering

## 📹 Video Conference Issues

### Error: "Camera/Microphone access denied"
**Cause:** Browser permissions not granted
**Solution:**
1. Click lock icon in address bar
2. Allow camera and microphone
3. Refresh the page
4. Check system settings for app permissions

### Error: "Jitsi Meet failed to load"
**Cause:** Network issues or blocked domain
**Solution:**
1. Check internet connection
2. Disable ad blockers temporarily
3. Whitelist meet.jit.si domain
4. Try different browser

## 📄 File Upload Errors

### Error: "File too large"
**Cause:** File exceeds 10MB limit
**Solution:**
1. Compress the file
2. Use cloud storage links instead
3. Split into multiple smaller files
4. Check UPLOAD_MAX_SIZE in environment

### Error: "Invalid file type"
**Cause:** Unsupported file format
**Solution:**
1. Convert to supported format (PDF, JPG, PNG)
2. Check ALLOWED_FILE_TYPES in config
3. Use documents feature for text content

## 🔧 Build & Deployment Errors

### Error: "Module build failed"
**Cause:** Dependency or syntax issues
**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### Error: "Error: Headers can only be modified during the request lifecycle"
**Cause:** Next.js 15 async headers issue
**Solution:**
1. Update to latest Next.js version
2. Use proper async/await with headers
3. This is a warning, not blocking error

### Error: "Failed to compile"
**Cause:** TypeScript or ESLint errors
**Solution:**
1. Run: `npm run type-check`
2. Fix TypeScript errors
3. Run: `npm run lint --fix`
4. Check for missing imports

## 💾 Session & Cookie Errors

### Error: "Invalid CSRF token"
**Cause:** Session mismatch or expired token
**Solution:**
1. Clear browser cookies
2. Sign out and sign in again
3. Check NEXTAUTH_SECRET is consistent
4. Disable browser extensions

### Error: "Session expired"
**Cause:** JWT token timeout
**Solution:**
1. Sign in again
2. Increase session.maxAge in auth config
3. Implement refresh token logic

## 🎨 Whiteboard Issues

### Error: "Canvas is undefined"
**Cause:** Fabric.js not loaded properly
**Solution:**
1. Check Fabric.js version (must be 5.3.0)
2. Clear browser cache
3. Verify import: `import { fabric } from 'fabric'`
4. Wait for component mount before initializing

### Error: "Failed to save whiteboard"
**Cause:** API or permission issues
**Solution:**
1. Check user has edit permissions
2. Verify room ID is correct
3. Check network tab for API errors
4. Ensure canvas data is valid JSON

## 🚀 Performance Issues

### Slow Page Load
**Causes & Solutions:**
1. **Large bundle size**
   - Run bundle analyzer: `npm run analyze`
   - Implement code splitting
   - Lazy load heavy components

2. **Slow database queries**
   - Add database indexes
   - Optimize Prisma queries
   - Use pagination

3. **Memory leaks**
   - Clear intervals/timeouts
   - Remove event listeners
   - Cleanup useEffect hooks

## 🔍 Debugging Tips

### Enable Debug Mode
```env
# In .env.local
DEBUG_MODE=true
NEXTAUTH_DEBUG=true
PRISMA_LOG=query,info,warn,error
```

### Check Browser Console
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for cookies/storage

### Check Server Logs
```bash
# View Next.js logs
npm run dev

# View Docker logs
docker logs vidibemus-postgres

# View Prisma queries
DEBUG="prisma:query" npm run dev
```

## 📞 Still Need Help?

If your issue isn't listed here:

1. **Search existing issues**: GitHub Issues
2. **Ask community**: Discord/Slack
3. **Contact support**: support@videbimus.ai
4. **Emergency hotline**: For production issues

When reporting issues, include:
- Error message (exact)
- Steps to reproduce
- Browser and OS
- Screenshots if applicable
- Relevant logs