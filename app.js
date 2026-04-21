const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');
const next = require('next');

const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const hasProductionBuild = fs.existsSync(buildIdPath);
const dev = process.env.NODE_ENV !== 'production' || !hasProductionBuild;
const hostname = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3000);

if (!hasProductionBuild) {
  process.stdout.write(
    'No production build found (.next/BUILD_ID). Starting in development mode.\n',
  );
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      })
      .listen(port, hostname, () => {
        process.stdout.write(
          `It works! Next.js running on http://${hostname}:${port}\n`,
        );
      });
  })
  .catch((err) => {
    process.stderr.write(
      `Failed to start Next.js server: ${err?.stack || String(err)}\n`,
    );
    process.exit(1);
  });
