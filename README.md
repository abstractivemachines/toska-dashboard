# ToskaMesh Dashboard

The ToskaMesh Dashboard UI is separated from the core mesh services. It consumes the Gateway dashboard proxy endpoints exposed by `toska-mesh-cs`.

## Local development

```bash
cd /home/jason/src/toska-dashboard/src/Dashboard
npm install
VITE_GATEWAY_BASE_URL=http://localhost:5000 npm run dev
```

## Build the Docker image

```bash
docker build -t toskamesh-dashboard:latest -f /home/jason/src/toska-dashboard/deployments/Dockerfile.Dashboard /home/jason/src/toska-dashboard
```

## Build output and static hosting

The Dashboard is a Vite app (no .NET solution). The Dockerfile runs `npm run build` and serves the resulting static assets via nginx. If you want to host with S3 + CloudFront instead, run the build locally:

```bash
cd /home/jason/src/toska-dashboard/src/Dashboard
npm install
npm run build
```

Then upload `dist/` to your bucket and point CloudFront at it. This repo does not include an S3/CloudFront deployment pipeline yet.

## Helm chart

The Helm chart lives under `helm/toskamesh-dashboard`.

```bash
helm install toskamesh-dashboard /home/jason/src/toska-dashboard/helm/toskamesh-dashboard \
  -f /home/jason/src/toska-dashboard/helm/toskamesh-dashboard/values-eks-dev.yaml
```

## Related repositories

- Core mesh services: `/home/jason/src/toska-mesh-cs`
