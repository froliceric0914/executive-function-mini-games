# Deployment

## GitHub Pages

This project deploys to GitHub Pages automatically whenever a commit reaches
the `main` branch. The workflow builds the Vite app and publishes the `dist`
directory.

The public address is:

`https://froliceric0914.github.io/executive-function-mini-games/`

To enable it for the first time, open the repository's **Settings → Pages** and
set **Build and deployment → Source** to **GitHub Actions**.

## Access from China

GitHub Pages is straightforward and free, but availability and speed from
mainland China can vary by mobile network. Test the public address over the
networks you use. If it proves unreliable, keep GitHub Actions for CI and move
only the deployment target to a China-optimized provider later.
