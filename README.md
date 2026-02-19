# OpenClaw Dashboard

A modern, self-hosted web dashboard for [OpenClaw](https://github.com/openclaw/openclaw) AI agents. Monitor your agent's models, cron jobs, skills, usage, memory, and more — all from a clean UI.

Built with **Next.js 16**, **Tailwind CSS v4**, **shadcn/ui**, and **Recharts**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

### 📊 Overview
System status at a glance — uptime, active model, today's token usage & cost, active cron jobs, skills count, upcoming events, and quick links.

### 🤖 Models
View and manage AI model routing. Cards grouped by role (Primary, Fallback, Sub-Agent, Embedding) with provider details and context window info.

### ⏰ Cron Jobs
Active/inactive split view with human-readable schedules ("9:00 AM · Daily"). One-time jobs show full date+time. Collapsible inactive section.

### 🧩 Skills
Active skills displayed as cards. Inactive skills hidden behind a collapsible "Available Skills" dropdown.

### 📈 Usage
Interactive Recharts bar chart with 7d / 30d / All time period selector. Stats cards, model-by-model breakdown, and daily usage table.

### 📅 Calendar
Monthly calendar view generated from cron jobs. Click any day to see a timeline modal. Color coding: green = one-time, blue = recurring. "All Events" section for non-daily jobs.

### 🧠 Memory
Browse long-term memory (MEMORY.md), daily notes (memory/*.md), and guides. Full file viewer.

### 📝 Logs
Filtered log viewer with level badges (info/warn/error) and auto-refresh.

### ⚙️ Config Files
Clickable file list → click to view contents → back button. Clean file browser for workspace config.

### 🔧 Setup
Compact overview of your entire setup: Agent info, Infrastructure, Network, Models, Security, and Smart Optimizations (cost savings, reliability features).

### 💰 Expenses
Cost tracking with category breakdown and trends.

### 📰 Digests
View configured news briefing cron jobs and their schedules.

### 🔑 API Keys
List of configured API integrations with status indicators.

### 🏗️ Projects
Project cards showing workspace projects with stack info and file listings.

### 🔍 Search
Full workspace search powered by OpenClaw's search API.

### 📡 Activity Feed
Timeline view combining cron job runs and system events.

### 👤 Accounts
Connected platform accounts overview.

### ⚙️ Settings
Dashboard and system configuration.

---

## Architecture

```
Browser → Cloudflare Tunnel (optional) → Next.js Dashboard (:3100)
                                              ↓
                                     OpenClaw Control UI API (:3001)
```

The dashboard proxies all API calls through Next.js API routes to the OpenClaw Control UI running on `localhost:3001`.

---

## Installation

### Prerequisites
- **Node.js** 22+ (recommended via nvm)
- **OpenClaw** running with Control UI enabled on port 3001
- **npm** or **bun**

### Setup

```bash
# Clone the repo
git clone https://github.com/openclaw/openclaw-dashboard.git
cd openclaw-dashboard

# Install dependencies
npm install

# Configure (optional)
cp env.example.txt .env
# Edit .env to set OPENCLAW_API_URL if not localhost:3001

# Build
npm run build

# Start (production)
npm start -- -p 3100
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_API_URL` | `http://localhost:3001` | OpenClaw Control UI API URL |
| `PORT` | `3100` | Dashboard port |

### Run as systemd service (recommended)

```bash
sudo tee /etc/systemd/system/openclaw-dashboard.service > /dev/null <<EOF
[Unit]
Description=OpenClaw Dashboard (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/openclaw-dashboard
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3100
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now openclaw-dashboard
```

### Optional: Cloudflare Tunnel

For secure remote access without exposing ports:

```bash
cloudflared tunnel --url http://localhost:3100
```

Add Cloudflare Access for authentication (Google login, email allowlist, etc.).

---

## OpenClaw Configuration

Make sure your OpenClaw config has the Control UI enabled:

```yaml
controlUI:
  enabled: true
  port: 3001
```

The dashboard reads all data from these API endpoints:
- `/api/status` — System status & uptime
- `/api/models` — Model configuration
- `/api/cron` — Cron job listing
- `/api/skills` — Installed skills
- `/api/usage` — Token usage & costs
- `/api/config` — Configuration files
- `/api/logs` — Recent logs
- `/api/search` — Workspace search

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Charts:** Recharts
- **Icons:** Tabler Icons + Lucide React
- **Search:** KBar (Cmd+K command palette)
- **Themes:** Multiple themes with dark mode support

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

Built with 🦞 by the [OpenClaw](https://github.com/openclaw) community