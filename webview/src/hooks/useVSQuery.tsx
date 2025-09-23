import { useEffect, useState } from 'react';
import type { ActionKey } from '../../../src/webviewbackend';

// @ts-ignore: VSCode API is injected at runtime
export const vscodeAPI = acquireVsCodeApi();

export function useVSQuery<T>(command: ActionKey) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const refresh = () => vscodeAPI.postMessage({ command });

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Message received from extension:', event.data);
            // The extension wraps responses as { success: boolean, data?: T, error?: string }
            const envelope = event.data as { success?: boolean; data?: T; error?: string };
            if (envelope && envelope.success) {
                setData(envelope.data ?? null);
                setStatus("success");
            } else {
                console.error('Error response from extension:', envelope?.error);
                setStatus("error");
            }
        };

        window.addEventListener('message', handleMessage);
        vscodeAPI.postMessage({ command });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [command]);

    return { data, status, refresh };
}