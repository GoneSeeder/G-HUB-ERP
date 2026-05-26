# Cloudflare Hosting

This project is not a static-only app. It uses Next.js, NestJS, PostgreSQL, file uploads, and Socket.IO realtime events. The recommended Cloudflare setup is to keep the Docker stack running on a server, then expose the frontend through Cloudflare Tunnel.

## Architecture

- Cloudflare Tunnel exposes one public hostname, for example `ghub.example.com`.
- The public hostname points to the Next.js frontend at `http://localhost:3000`.
- Next.js proxies `/api`, `/uploads`, and `/socket.io` to the backend.
- PostgreSQL stays private and should not be exposed publicly.
- Thai ID Bridge stays local on each scanner PC because the browser talks to `127.0.0.1:32123`.

## First-Time Setup

1. Make sure the app is running:

   ```powershell
   docker compose up -d
   ```

2. Log in to Cloudflare:

   ```powershell
   tools\cloudflared.exe tunnel login
   ```

3. Create a tunnel:

   ```powershell
   tools\cloudflared.exe tunnel create g-hub
   ```

4. Copy the example config:

   ```powershell
   Copy-Item cloudflare\tunnel\config.example.yml cloudflare\tunnel\config.yml
   ```

5. Edit `cloudflare\tunnel\config.yml`:

   ```yaml
   tunnel: g-hub
   credentials-file: C:\Users\User\.cloudflared\<TUNNEL_ID>.json

   ingress:
     - hostname: ghub.example.com
       service: http://localhost:3000
     - service: http_status:404
   ```

6. Create the DNS route:

   ```powershell
   tools\cloudflared.exe tunnel route dns g-hub ghub.example.com
   ```

7. Start the tunnel:

   ```powershell
   tools\start-cloudflare-tunnel.cmd
   ```

## Production Notes

- Change `.env` secrets before using this outside the local network.
- Keep database backups enabled.
- Do not expose port `5432` publicly.
- If the app runs on another machine, install the Thai ID Bridge only on PCs that scan Thai ID cards.
- For always-on hosting, run Docker and the Cloudflare Tunnel as Windows services or scheduled tasks on the host machine.
