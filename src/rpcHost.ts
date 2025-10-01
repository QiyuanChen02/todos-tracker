import * as vscode from 'vscode';
import type { RpcMessage, RpcRequest, RpcSuccess, RpcError } from './rpcProtocol';
import z from 'zod';

type ProcedureCtx = {
  panel: vscode.WebviewPanel;
  context: vscode.ExtensionContext;
  vscode: typeof vscode;
};

export type Procedure<S extends z.ZodType, R> = {
  _input: z.infer<S>;
  _output: R;
  inputSchema: S;
  resolver: (input: z.infer<S>, ctx: ProcedureCtx) => R | Promise<R>;
};

export type InferInput<P> = P extends Procedure<infer S, any> ? z.infer<S> : never;
export type InferOutput<P> = P extends Procedure<any, infer R> ? Awaited<R> : never;

export function procedure<S extends z.ZodType, R>(schema: S, resolver: Procedure<S, R>['resolver']) {
    return { 
        inputSchema: schema,
        resolver 
    } as Procedure<S, R>;
}

export type RouterDef = { [k: string]: Procedure<any, any> | RouterDef };

export function createRouter<T extends RouterDef>(def: T): T {
    return def;
}

function isProcedure(obj: any): obj is Procedure<any, any> {
    return obj && typeof obj === 'object' && "resolver" in obj && "inputSchema" in obj;
}

function getProcedure(router: RouterDef, path: string): Procedure<any, any> {
    const parts = path.split('.');
    let current: any = router;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            throw new Error(`Path not found: ${path}`);
        }
    }

    if (!isProcedure(current)) {
        throw new Error(`Path is not a procedure: ${path}`);
    }
    return current;
}

export function attachRouterToPanel(router: RouterDef, panel: vscode.WebviewPanel, context: vscode.ExtensionContext, vscodeApi: typeof vscode) {
    const subscribe = panel.webview.onDidReceiveMessage(async (msg: RpcMessage) => {
        if (msg.kind !== 'rpc/request') return;

        const request = msg as RpcRequest;
        try {
            const procedure = getProcedure(router, request.path);
            const parsed = procedure.inputSchema.safeParse(request.input);
            if (!parsed.success) {
                const response: RpcError = {
                    kind: 'rpc/error',
                    id: request.id,
                    error: { message: `Invalid input: ${parsed.error.message}` },
                };
                panel.webview.postMessage(response);
                return;
            }

            const result = await procedure.resolver(request.input, { panel, context, vscode: vscodeApi });
            const response: RpcSuccess = {
                kind: 'rpc/success',
                id: request.id,
                result,
            };
            panel.webview.postMessage(response);

        } catch (error) {
            const response: RpcError = {
                kind: 'rpc/error',
                id: request.id,
                error: { message: error instanceof Error ? error.message : 'Unknown error' },
            };
            panel.webview.postMessage(response);
        }
    });

    panel.onDidDispose(() => subscribe.dispose(), null, []);
}

