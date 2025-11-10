# Todos Tracker VSCode Extension - AI Coding Agent Instructions

## Project Architecture

This is a **VSCode extension** with a **React webview** that displays a kanban board for managing workspace todos. It uses a dual-workspace architecture:

- **Extension host** (`src/`): TypeScript compiled to `out/`, runs in VSCode's Node.js environment
- **Webview** (`webview/`): React + Vite SPA compiled to `webview/dist/`, runs in an embedded browser

### Key Components

1. **Extension Entry** (`src/extension.ts`): Activates on `onStartupFinished`, registers command `todos-tracker.openTodos` and status bar item
2. **Webview Panel** (`src/commands/openWebview.ts`): Creates/reuses singleton `WebviewPanel`, injects HTML from Vite build
3. **Type-Safe RPC** (`@webview-rpc`): Bidirectional communication between extension host and webview
   - Router defined in `src/router/router.ts` with Zod validation
   - Client in `webview/src/wrpc.ts` with React Query integration
   - Type sharing: `AppRouter` type exported from router, imported by webview
4. **Storage** (`src/database/createDatabase.ts`): Custom Prisma-like ORM over VSCode's `WorkspaceState` API
   - Stores arrays of items with UUIDs in workspace storage (per-workspace, not global)
   - Schema defined with Zod in `src/database/schema.ts`
5. **UI** (`webview/src/`): React 19 + Tailwind 4 + @dnd-kit for drag-and-drop kanban

## Development Workflow

### Running the Extension

- **Start dev mode**: Task `dev` already running (parallel tasks: `extension: watch` + `webview: dev`)
- **Test extension**: Press `F5` in VSCode to launch Extension Development Host
- **Build for production**: `yarn vscode:prepublish` (compiles extension + builds webview)

### Making Changes

**Extension code changes:**
- Edit `src/**/*.ts`
- TypeScript compiler watch rebuilds automatically (via `extension: watch` task)
- Reload extension host window (`Ctrl+R` in Extension Development Host)

**Webview code changes:**
- Edit `webview/src/**/*`
- Vite HMR auto-updates (via `webview: dev` task running on port, typically 5173)
- No reload needed for most React changes

**Schema changes:**
- Update `src/database/schema.ts` (Zod schema)
- Update corresponding router procedures in `src/router/router.ts`
- Types auto-propagate to webview via `AppRouter` type

### Important File Paths

- Extension modules use `.js` imports (e.g., `./database/createDatabase.js`) despite `.ts` sources - this is required for Node16 module resolution
- Webview resources served from `webview/dist` after build, using `localResourceRoots` in webview options

## Project-Specific Patterns

### RPC Communication Pattern

**Adding new RPC endpoints:**
1. Define procedure in `src/router/router.ts`:
   ```typescript
   myNewProcedure: procedure
     .input(z.object({ /* schema */ }))
     .resolve(async ({ input, ctx }) => {
       // Access ctx.db for database, ctx.vsContext for VSCode APIs
       return result;
     })
   ```
2. Use in webview with type safety:
   ```typescript
   const { data } = wrpc.useQuery("myNewProcedure", input);
   // or
   const mutation = wrpc.useMutation("myNewProcedure");
   ```

### Database Pattern (WorkspaceStateManager)

All CRUD operations are type-safe and validated with Zod:
```typescript
await ctx.db.todos.create({ title: "...", status: "todo", priority: "low" });
await ctx.db.todos.findMany();
await ctx.db.todos.updateById(id, updatedTodo);
await ctx.db.todos.deleteById(id);
```

IDs and `createdAt` auto-generated. Schema shape in `schema.ts` drives validation.

### Styling Conventions

- Uses Tailwind 4 with custom semantic color variables (`text-text`, `bg-background`, `border-border`)
- Utility-first approach, no separate CSS modules
- `clsx` + `tailwind-merge` via `cn()` helper in `webview/src/utils/cn.ts`

### Code Quality

- **Linting/Formatting**: Biome (not ESLint/Prettier) - tab indentation, double quotes
- **Type Safety**: Strict TypeScript, Zod for runtime validation
- Extension and webview have separate `tsconfig.json` files (don't cross-compile)

## Common Tasks

**Add a new todo property:**
1. Update `todoSchema` in `src/database/schema.ts`
2. Add mutation in `src/router/router.ts` (follow `changeTodoTitle` pattern)
3. Update UI in `webview/src/layout/board/TodoDetails.tsx`

**Add a new column to kanban:**
- Modify `ColumnId` type in `App.tsx` and `DragDrop.tsx`
- Update `status` enum in schema and column rendering logic

**Debug RPC issues:**
- Check browser console in webview (right-click webview → "Open Webview Developer Tools")
- Check extension host logs in Debug Console

## External Dependencies

- `@webview-rpc/*`: Type-safe RPC with React Query adapter
- `@dnd-kit/react`: Headless drag-and-drop (used in `DragDrop.tsx`)
- `react-day-picker` + `dayjs`: Date selection for deadlines
- `@vscode/codicons`: Icon font (served from node_modules, see `localResourceRoots`)
