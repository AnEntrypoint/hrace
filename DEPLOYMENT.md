# Hermes Agent - Deployment Guide

This guide covers deploying Hermes Agent to various environments.

## Local Development

### Quick Start

```bash
# Install dependencies
bun install

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development mode (with auto-reload)
bun run dev

# Or run directly
bun src/index.ts exec "your command"

# Start gateway server
bun src/cli/index.ts server 8000
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...          # OpenAI API key
HERMES_PROVIDER=openai         # LLM provider (openai, anthropic, etc.)
HERMES_MODEL=gpt-4-turbo       # Model to use

# Optional
LOG_LEVEL=info                 # Logging level (debug, info, warn, error)
NODE_ENV=development           # Environment (development, production)
HERMES_HOST=localhost          # Server host
HERMES_PORT=8000               # Server port
ANTHROPIC_API_KEY=sk-...       # For Anthropic provider
GITHUB_TOKEN=ghp_...           # For GitHub integration
```

## Docker Deployment

### Building Docker Image

Create `Dockerfile`:

```dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY tsconfig.json bunfig.toml ./

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Run server
CMD ["bun", "src/cli/index.ts", "server", "8000"]
```

### Build and Run

```bash
# Build image
docker build -t hermes-agent:latest .

# Run container
docker run -d \
  --name hermes-agent \
  -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  -e HERMES_MODEL=gpt-4-turbo \
  hermes-agent:latest

# View logs
docker logs -f hermes-agent

# Stop container
docker stop hermes-agent
```

## Kubernetes Deployment

### Create ConfigMap for Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: hermes-agent-config
data:
  LOG_LEVEL: "info"
  NODE_ENV: "production"
  HERMES_MODEL: "gpt-4-turbo"
  HERMES_PROVIDER: "openai"
```

### Create Secret for API Keys

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hermes-agent-secrets
type: Opaque
stringData:
  OPENAI_API_KEY: "sk-..."
  GITHUB_TOKEN: "ghp_..."
```

### Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hermes-agent
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hermes-agent
  template:
    metadata:
      labels:
        app: hermes-agent
    spec:
      containers:
      - name: hermes-agent
        image: hermes-agent:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: hermes-agent-config
        - secretRef:
            name: hermes-agent-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
```

### Create Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hermes-agent-service
spec:
  selector:
    app: hermes-agent
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create secrets and configmaps
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

# Deploy application
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/hermes-agent

# Scale deployment
kubectl scale deployment hermes-agent --replicas=5
```

## Cloud Platforms

### AWS Lambda

```bash
# Build and package for Lambda
bun run build

# Create deployment package
zip -r lambda-deployment.zip dist node_modules

# Upload to AWS Lambda
aws lambda update-function-code \
  --function-name hermes-agent \
  --zip-file fileb://lambda-deployment.zip
```

### Google Cloud Run

```bash
# Build container
docker build -t gcr.io/PROJECT_ID/hermes-agent:latest .

# Push to Google Container Registry
docker push gcr.io/PROJECT_ID/hermes-agent:latest

# Deploy to Cloud Run
gcloud run deploy hermes-agent \
  --image gcr.io/PROJECT_ID/hermes-agent:latest \
  --platform managed \
  --region us-central1 \
  --port 8000 \
  --set-env-vars OPENAI_API_KEY=sk-...
```

### AWS EC2

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repository
git clone https://github.com/AnEntrypoint/hrace.git
cd hrace

# Install dependencies
bun install

# Set environment variables
export OPENAI_API_KEY=sk-...

# Run with systemd
sudo tee /etc/systemd/system/hermes-agent.service > /dev/null <<EOF
[Unit]
Description=Hermes Agent
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/hrace
ExecStart=/home/ubuntu/.bun/bin/bun src/cli/index.ts server 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable hermes-agent
sudo systemctl start hermes-agent

# View status
sudo systemctl status hermes-agent
```

## Production Considerations

### Security

- Use environment variables for secrets
- Enable HTTPS/TLS for all connections
- Implement API rate limiting
- Set up authentication/authorization
- Enable request validation
- Monitor for suspicious activity
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)

### Performance

- Enable caching for frequently used data
- Implement connection pooling
- Monitor and optimize memory usage
- Use CDN for static assets
- Implement request batching
- Set up horizontal scaling

### Reliability

- Implement health checks
- Set up automated backups
- Use load balancing
- Implement circuit breakers
- Set up distributed tracing
- Monitor error rates and latencies

### Monitoring

```bash
# Enable structured logging
export LOG_LEVEL=info

# Monitor metrics
# - Request latency
# - Error rates
# - Memory usage
# - Model token usage
# - API response times

# Log aggregation
# Use ELK Stack, CloudWatch, or similar
```

### Scaling

- **Horizontal:** Add more instances
- **Vertical:** Increase instance resources
- **Database:** Use connection pooling
- **Cache:** Implement Redis for memory
- **Load Balancer:** Distribute traffic

## Backup and Recovery

### Data Backup

```bash
# Backup memory/data
tar -czf hermes-backup-$(date +%Y%m%d).tar.gz src/ data/

# Restore backup
tar -xzf hermes-backup-20240522.tar.gz
```

### Disaster Recovery

1. Keep code in version control
2. Use infrastructure as code (Terraform, CloudFormation)
3. Regular backup and restore testing
4. Document recovery procedures
5. Maintain runbooks for common issues

## Monitoring and Logging

### Key Metrics

- **Availability:** Uptime percentage
- **Performance:** Response time, throughput
- **Reliability:** Error rate, success rate
- **Resources:** CPU, memory, disk usage
- **API Usage:** Token consumption, cost

### Example: DataDog Monitoring

```typescript
import { StatsD } from 'node-dogstatsd';

const dogstatsd = new StatsD();

// Track execution time
const start = Date.now();
await skill.execute(args, context);
dogstatsd.histogram('skill.execution_time', Date.now() - start);

// Track errors
try {
  // ...
} catch (error) {
  dogstatsd.increment('errors.total');
  dogstatsd.increment(`errors.${error.name}`);
}
```

## Troubleshooting

### Common Issues

**Memory Issues:**
```bash
# Check memory usage
ps aux | grep bun

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" bun src/index.ts
```

**Timeout Issues:**
```bash
# Increase timeout
export HERMES_TIMEOUT=60000

# Check API rate limits
# Adjust request batching
```

**API Key Issues:**
```bash
# Verify API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check key permissions
# Ensure key hasn't been rotated
```

## Best Practices

1. **Use environment variables** for all configuration
2. **Run health checks** regularly
3. **Monitor resource usage** proactively
4. **Implement graceful shutdown** for clean state
5. **Use structured logging** for easier debugging
6. **Implement circuit breakers** for external APIs
7. **Cache responses** appropriately
8. **Test deployments** in staging first
9. **Document deployment procedures**
10. **Use version control** for all changes

## Support

For deployment issues:
- Check logs: `docker logs` / `kubectl logs` / System logs
- Verify environment variables
- Check API keys and permissions
- Review recent code changes
- Open a GitHub issue with details
