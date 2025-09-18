import { useEffect, useState } from 'react';

// @ts-ignore: VSCode API is injected at runtime
const vscode = acquireVsCodeApi();

export interface VSCodeMessage {
    type: string;
    payload?: any;
}

export function useVSCodeMessage() {
    const [data, setData] = useState<any>(null);
    const [messageType, setMessageType] = useState<string>('');

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message: VSCodeMessage = event.data;
            setData(message.payload);
            setMessageType(message.type);
            
            // You can handle specific message types here
            switch (message.type) {
                case 'INIT_DATA':
                    console.log('Initial data received:', message.payload);
                    break;
                case 'DATA_UPDATE':
                    console.log('Data update received:', message.payload);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        
        vscode.postMessage({ type: 'DATA_REQUEST' });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    const sendMessage = (type: string, payload?: any) => {
        vscode.postMessage({ type, payload });
    };

    return { data, messageType, sendMessage };
}