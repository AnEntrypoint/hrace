# Hermes Agent - Dependency Analysis for Bun Migration

## Core Dependencies (Always Installed)
- openai==2.24.0 - LLM provider base
- httpx[socks]==0.28.1 - HTTP client with proxy support
- requests==2.33.0 - HTTP client
- pydantic==2.13.4 - Data validation
- python-dotenv==1.2.2 - Environment config
- fire==0.7.1 - CLI argument parsing
- rich==14.3.3 - Terminal formatting
- tenacity==9.1.4 - Retry logic
- pyyaml==6.0.3 - YAML parsing
- ruamel.yaml==0.18.17 - Advanced YAML
- jinja2==3.1.6 - Template engine
- prompt_toolkit==3.0.52 - Interactive CLI
- croniter==6.0.0 - Cron scheduling
- PyJWT[crypto]==2.12.1 - JWT authentication
- psutil==7.2.2 - Process management
- tzdata==2025.3 - Timezone data (Windows)

## Optional Provider Integrations
- anthropic==0.86.0
- exa-py==2.10.2 (web search)
- firecrawl-py==4.17.0 (web scraping)
- parallel-web==0.4.2
- fal-client==0.13.1 (image generation)
- edge-tts==7.2.7 (text-to-speech)
- modal==1.3.4
- daytona==0.155.0
- vercel==0.5.7
- hindsight-client==0.6.1
- boto3==1.42.89 (AWS)
- azure-identity==1.25.3 (Azure)

## Messaging Extras
- python-telegram-bot==22.6 (Telegram)
- discord.py==2.7.1 (Discord)
- slack-bolt==1.27.0 + slack-sdk==3.40.1 (Slack)
- mautrix==0.21.0 (Matrix)
- aiohttp==3.13.3 (async HTTP)

## Development & Testing
- pytest==9.0.2
- pytest-asyncio==1.3.0
- pytest-timeout==2.4.0
- debugpy==1.8.20
- ruff==0.15.10
- mcp==1.26.0
- ty==0.0.21

## Voice & ML Features
- faster-whisper==1.2.1 (speech-to-text)
- sounddevice==0.5.5
- numpy==2.4.3
- elevenlabs==1.59.0 (premium TTS)

## Terminal & PTY
- ptyprocess==0.7.0 (POSIX)
- pywinpty==2.0.15 (Windows)
- simple-term-menu==1.6.6

## Other
- honcho-ai==2.0.1 (process manager)
- Markdown==3.10.2
- aiosqlite==0.22.1
- asyncpg==0.31.0
- aiohttp-socks==0.11.0
- qrcode==7.4.2
- brotlicffi==1.2.0.1

## NPM/Bun Conversion Strategy
1. **HTTP clients**: httpx→node-fetch/undici, requests→undici
2. **Data validation**: pydantic→zod/valibot
3. **CLI**: fire→commander/yargs, prompt_toolkit→enquirer/chalk
4. **Templates**: jinja2→ejs/eta
5. **YAML**: pyyaml/ruamel→yaml/js-yaml
6. **Scheduling**: croniter→node-cron/croner
7. **Auth**: PyJWT→jsonwebtoken
8. **Formatting**: rich→chalk/colorize
9. **Retry**: tenacity→p-retry/async-retry
10. **Process**: psutil→pidusage/ps-list
11. **LLM APIs**: Keep native anthropic/openai SDK usage
12. **Messaging**: discord.js, telegraf, slack-sdk (npm), matrix-js-sdk
13. **ML**: Use Node ML libraries (TensorFlow.js, ML.js)
14. **Testing**: vitest, jest (keep similar structure)
