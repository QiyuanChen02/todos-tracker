import { useCallback, useState } from 'react';
import type { ActionKey } from '../../../src/webviewbackend';
import { vscodeAPI } from './useVSQuery';

export function useVSMutation<T>(command: ActionKey) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback((mutationData?: any) => {
        setStatus("loading");
        setError(null);
        
        try {
            // Send the message to the extension
            vscodeAPI.postMessage({ 
                command, 
                data: mutationData as T
            });
            setStatus("success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            setStatus("error");
        }
    }, [command]);

    return {
        mutate,
        status,
        error,
    };
}