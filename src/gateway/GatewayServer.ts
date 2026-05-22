import { Logger } from '../utils/Logger';
import { HermesAgent } from '../agent/HermesAgent';
import { GatewayConfig } from '../types/config';

export class GatewayServer {
  private logger: Logger;
  private config: GatewayConfig;
  private agent: HermesAgent;
  private server?: any;

  constructor(agent: HermesAgent, config: Partial<GatewayConfig> = {}) {
    this.agent = agent;
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 8000,
      ssl: config.ssl || false,
      ...config
    };
    this.logger = new Logger('hermes:gateway');
  }

  async start(): Promise<void> {
    this.logger.info(`Starting gateway server on ${this.config.host}:${this.config.port}`);

    // TODO: Implement HTTP server using Bun's native server capabilities
    // Use fetch-based routing approach
    const server = Bun.serve({
      hostname: this.config.host,
      port: this.config.port,
      fetch: this.handleRequest.bind(this)
    });

    this.logger.info(`Gateway server started at ${server.hostname}:${server.port}`);
  }

  private async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    try {
      // Health check endpoint
      if (pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Agent command endpoint
      if (pathname === '/agent/execute' && req.method === 'POST') {
        const body = await req.json() as { command: string };
        const result = await this.agent.executeCommand(body.command);
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // WebSocket upgrade for real-time streaming
      if (pathname === '/ws' && req.headers.get('upgrade') === 'websocket') {
        const { socket, response } = Bun.upgrade(req);
        this.handleWebSocket(socket);
        return response;
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      this.logger.error('Request handling error', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private handleWebSocket(socket: WebSocket): void {
    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const result = await this.agent.executeCommand(data.command);
        socket.send(JSON.stringify({ status: 'success', result }));
      } catch (error) {
        socket.send(JSON.stringify({ status: 'error', error: String(error) }));
      }
    };
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping gateway server');
    if (this.server) {
      // TODO: Implement server stop logic
    }
  }
}
