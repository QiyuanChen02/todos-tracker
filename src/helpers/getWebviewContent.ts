import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
    const htmlPath = path.join(context.extensionPath, 'webview', 'dist', 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
        return `<!DOCTYPE html><html><body><h1>Please build webview first</h1></body></html>`;
    }
    
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // SAFER: Validate the path before creating URI
    const distPath = path.join(context.extensionPath, 'webview', 'dist');
    if (!fs.existsSync(distPath)) {
        return `<!DOCTYPE html><html><body><h1>Dist folder not found</h1></body></html>`;
    }

    // SAFER: Use try-catch for URI creation
    let baseUri;
    try {
        baseUri = webview.asWebviewUri(vscode.Uri.file(distPath));
    } catch (error) {
        console.error('Failed to create webview URI:', error);
        return `<!DOCTYPE html><html><body><h1>Configuration error</h1></body></html>`;
    }

    // SIMPLER: Use a more conservative replacement approach
    htmlContent = htmlContent.replace(
        /(href|src)=["']([^"']*)["']/g,
        (match, attr, resourcePath) => {
            if (resourcePath.startsWith('http') || 
                resourcePath.startsWith('data:') || 
                resourcePath.startsWith('#') || 
                resourcePath === '') {
                return match;
            }
            
            // Handle relative paths safely
            const cleanPath = resourcePath.replace(/^\//, '');
            try {
                const resourceUri = webview.asWebviewUri(
                    vscode.Uri.file(path.join(distPath, cleanPath))
                );
                return `${attr}="${resourceUri}"`;
            } catch (error) {
                console.warn('Failed to create URI for:', resourcePath, error);
                return match; // Fallback to original
            }
        }
    );

    const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource}; script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data: https:;">`;
    
    htmlContent = htmlContent.replace('</head>', `${cspMetaTag}</head>`);

    return htmlContent;
}