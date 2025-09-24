import * as vscode from 'vscode';

type ProcCtx = {
  panel: vscode.WebviewPanel;
  context: vscode.ExtensionContext;
  vscode: typeof vscode;
};

type Procedure<I, O> = {
  _input: I;
  _output: O;
  resolver: (input: I, ctx: ProcCtx) => O | Promise<O>;
};

export function procedure<I, O>(resolver: Procedure<I,O>['resolver']): Procedure<I, O> {
    return { resolver } as Procedure<I, O>;
}

type RouterDef = { [k: string]: Procedure<any, any> | RouterDef };

export function createRouter<T extends RouterDef>(def: T): T {
    return def;
}

function isProcedure(obj: any): obj is Procedure<any, any> {
    return obj && typeof obj === 'object' && typeof obj.resolver === 'function';
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

import type { RpcMessage, RpcRequest, RpcSuccess, RpcError } from './rpcProtocol';

export function attachRouterToPanel(router: RouterDef, panel: vscode.WebviewPanel, context: vscode.ExtensionContext, vscodeApi: typeof vscode) {
    const subscribe = panel.webview.onDidReceiveMessage(async (msg: RpcMessage) => {
        if (msg.kind !== 'rpc/request') return;

        const request = msg as RpcRequest;
        try {
            const procedure = getProcedure(router, request.path);
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

