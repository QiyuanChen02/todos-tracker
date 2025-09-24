import { v4 as uuidv4 } from "uuid";
import type { RpcMessage, RpcRequest } from "../../src/rpcProtocol";

declare global {
    interface Window {
        acquireVsCodeApi: () => {
            postMessage: (msg: any) => void;
        };
    }
}

const vscode = window.acquireVsCodeApi();
const pending = new Map<string, { resolve: (v: any)=>void; reject:(e: any)=>void }>();

window.addEventListener('message', (event) => {
    const message = event.data as RpcMessage;
    if (!message || !message.kind) return;
    if (message.kind === 'rpc/success') {
        pending.get(message.id)?.resolve(message.result);
        pending.delete(message.id);
    } else if (message.kind === 'rpc/error') {
        pending.get(message.id)?.reject(new Error(message.error.message));
        pending.delete(message.id);
    }
});

export function rpcCall<I, O>(path: string, input: I): Promise<O> {
    const id = uuidv4();
    const req: RpcRequest = {
        kind: 'rpc/request',
        id,
        path,
        input,
    }
    vscode.postMessage(req);
    return new Promise<O>((resolve, reject) => pending.set(id, { resolve, reject }));
}
