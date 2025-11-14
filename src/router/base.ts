import { initWRPC } from "@webview-rpc/host";
import type * as vscode from "vscode";

export type Context = {
	vsContext: vscode.ExtensionContext;
};

export const { router, procedure } = initWRPC.context<Context>().create();
