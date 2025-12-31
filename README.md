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

## Talos / Kubernetes (single-node)

The Talos quick start in `toska-mesh-cs` assumes the control plane is reachable at `talos`
and the registry is `talos:30500`. The ToskaMesh gateway is exposed via NodePort `30080`.

This repo ships a Talos-focused values file at `helm/toskamesh-dashboard/values-talos.yaml`
that:
- publishes the dashboard on NodePort `30081`
- points `gatewayBaseUrl` at `http://talos:30080`

Install on Talos (namespace `toskamesh`):
```bash
kubectl get ns toskamesh >/dev/null 2>&1 || kubectl create namespace toskamesh
helm upgrade --install toskamesh-dashboard /home/jason/src/toska-dashboard/helm/toskamesh-dashboard \
  -n toskamesh \
  -f /home/jason/src/toska-dashboard/helm/toskamesh-dashboard/values-talos.yaml
```

Access the UI at:
```
http://talos:30081
```

If you deploy with a different Service type or namespace, confirm the endpoint with:
```bash
kubectl get svc -n <namespace> toskamesh-dashboard-dashboard -o wide
kubectl get ingress -n <namespace>
```

## Related repositories

- Core mesh services: `/home/jason/src/toska-mesh-cs`
