import { useEffect, useState } from 'react';
import type { ActionKey } from '../../../src/webviewbackend';

// @ts-ignore: VSCode API is injected at runtime
const vscode = acquireVsCodeApi();


export function useVSQuery<T>(command: ActionKey) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<"loading" | "success">("loading");

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Message received from extension:', event.data);
            const message: T = event.data;
            setData(message);
            setStatus("success");
        };

        window.addEventListener('message', handleMessage);
        vscode.postMessage({ command });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [command]);

    return { data, status };
}