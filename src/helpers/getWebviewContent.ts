import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const DEV_PORT = 5173;
const DEV_ENTRY = '/src/main.tsx';

export async function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {

    const isDev = context.extensionMode === vscode.ExtensionMode.Development;

  // Strong random nonce
  const nonce = randomUUID()

  const cspBase = [
    `default-src 'none'`,
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `font-src ${webview.cspSource}`
  ].join('; ') + ';';

  if (isDev) {
    // Map FULL URLs via asExternalUri (important in remote/containers)
    const refreshLocal = vscode.Uri.parse(`http://localhost:${DEV_PORT}/@react-refresh`);
    const clientLocal  = vscode.Uri.parse(`http://localhost:${DEV_PORT}/@vite/client`);
    const entryLocal   = vscode.Uri.parse(`http://localhost:${DEV_PORT}${DEV_ENTRY}`);

    const [refreshUri, clientUri, entryUri] = await Promise.all([
      vscode.env.asExternalUri(refreshLocal),
      vscode.env.asExternalUri(clientLocal),
      vscode.env.asExternalUri(entryLocal),
    ]);

    const origin   = `${clientUri.scheme}://${clientUri.authority}`;
    const wsOrigin = origin.replace(/^http/, 'ws');

    const csp = [
      `default-src 'none'`,
      `img-src ${webview.cspSource} https: data:`,
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `font-src ${webview.cspSource}`,
      // 'unsafe-eval' is needed in DEV for React Fast Refresh
      `script-src 'nonce-${nonce}' 'unsafe-eval' ${origin}`,
      `connect-src ${origin} ${wsOrigin} ws://localhost:${DEV_PORT} ws://127.0.0.1:${DEV_PORT}`,
    ].join('; ') + ';';

    return `
    <!doctype html>
    <html>
        <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Dev</title>
        </head>
        <body>
        <div id="root"></div>

        <!-- 1) React Refresh preamble (must come first) -->
        <script type="module" nonce="${nonce}">
            import RefreshRuntime from "${refreshUri.toString(true)}";
            RefreshRuntime.injectIntoGlobalHook(window);
            window.$RefreshReg$ = () => {};
            window.$RefreshSig$ = () => (type) => type;
            window.__vite_plugin_react_preamble_installed__ = true;
        </script>

        <!-- 2) Vite HMR client -->
        <script type="module" nonce="${nonce}" src="${clientUri.toString(true)}"></script>

        <!-- 3) Your app entry -->
        <script type="module" nonce="${nonce}" src="${entryUri.toString(true)}"></script>
        </body>
    </html>
    `;

    }
    const htmlPath = path.join(context.extensionPath, 'webview', 'dist', 'index.html');
    const distPath = path.join(context.extensionPath, 'webview', 'dist');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    htmlContent = htmlContent.replace(
        /(href|src)=["']([^"']*)["']/g,
        (match, attr, url) => {
            if (url.startsWith('http') || 
                url.startsWith('data:') || 
                url.startsWith('#') || 
                url === '') {
                return match;
            }
            
            // Handle relative paths safely
            const cleanPath = url.replace(/^\//, '');
            const clean = url.replace(/^\//, '');
            const onDisk = vscode.Uri.file(path.join(distPath, clean));
            const webviewUri = webview.asWebviewUri(onDisk).toString();
            return `${attr}="${webviewUri}"`;
        }
    );

    const prodCsp = `
        ${cspBase}
        script-src 'nonce-${nonce}' ${webview.cspSource};
        connect-src ${webview.cspSource};
    `.replace(/\n+/g, ' ');

    
  // Inject CSP + nonce onto any module scripts (if you want to enforce nonce)
    const html = htmlContent
        .replace('</head>', `<meta http-equiv="Content-Security-Policy" content="${prodCsp}"></head>`)
        .replace(/<script([^>]*)type="module"([^>]*)>/g, `<script$1type="module"$2 nonce="${nonce}">`);
    return html;
}