import { createRpcClient } from "@webview-rpc/client";
import type { AppRouter } from "../../src/router/router";

export const wrpc = createRpcClient<AppRouter>();
