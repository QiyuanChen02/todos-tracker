import type { RpcMessage, RpcRequest } from "../../src/rpcProtocol";
import type { RouterDef } from "../../src/rpcHost";
import type { InputAtPath, OutputAtPath, PathKeys } from "./hooks/useRPC";

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

export function rpcCall<R extends RouterDef, P extends PathKeys<R>>(path: P, input: InputAtPath<R, P>): Promise<OutputAtPath<R, P>> {
    const id = crypto.randomUUID();
    const req: RpcRequest = {
        kind: 'rpc/request',
        id,
        path,
        input,
    }
    vscode.postMessage(req);
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
