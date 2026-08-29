# Deployment

## Recommended production host

Use **Tencent Cloud EdgeOne Pages (China console)** for this static Vite app. It
can connect directly to the GitHub repository and automatically build and deploy
each push to `main`.

This is preferred over GitHub Pages for the production URL because the primary
use case is access from an iPhone in mainland China.

## EdgeOne Pages setup

1. Open EdgeOne Pages in the Tencent Cloud China console.
2. Create a project and import the GitHub repository.
3. Select the `main` branch.
4. Set the install command to `pnpm install --frozen-lockfile`.
5. Set the build command to `pnpm build`.
6. Set the output directory to `dist`.
7. Deploy, then test the generated URL on cellular data and Wi-Fi in China.

EdgeOne's Git integration performs deployment after CI succeeds at the source
level. The GitHub Actions workflow in `.github/workflows/ci.yml` independently
checks TypeScript and the production build on pushes and pull requests.

## Domain and mainland availability

For the simplest first deployment, use the EdgeOne-provided URL and test it from
the target mobile networks. A custom domain using a Chinese-mainland or global
acceleration region requires ICP filing. Without an ICP filing, select an
outside-mainland/global-excluding-mainland region; mainland users may still
connect, but performance is not guaranteed to equal mainland edge delivery.

For consistently optimized mainland delivery, obtain a domain, complete ICP
filing, bind it to EdgeOne, enable HTTPS, and select mainland or global
acceleration.
