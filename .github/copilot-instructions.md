# Todos Tracker VSCode Extension - AI Coding Agent Instructions

## Project Architecture

This is a **VSCode extension** with a **React webview** that displays both kanban and calendar views for managing workspace todos. It uses a dual-workspace architecture:

- **Extension host** (`src/`): TypeScript compiled to `out/`, runs in VSCode's Node.js environment
- **Webview** (`webview/`): React + Vite SPA compiled to `webview/dist/`, runs in an embedded browser

### Key Components

1. **Extension Entry** (`src/extension.ts`): Activates on `onStartupFinished`, registers command `todos-tracker.openTodos` and status bar item
2. **Webview Panel** (`src/commands/openWebview.ts`): Creates/reuses singleton `WebviewPanel`, injects HTML from Vite build
3. **Type-Safe RPC** (`@webview-rpc`): Bidirectional communication between extension host and webview
   - **Modular routers**: `src/router/router.ts` composes `todoRouter`, `kanbanRouter`, `calendarRouter`, and `workspaceStateRouter`
   - Each router is a separate file (e.g., `todoRouter.ts`) for maintainability
   - Client in `webview/src/wrpc.ts` with React Query integration
   - Type sharing: `AppRouter` type exported from router, imported by webview
4. **Storage Layer** (`src/storage/`): Direct VSCode workspace state management (not a custom ORM)
   - Each entity has its own storage module: `todoStorage.ts`, `kanbanColumnStorage.ts`, `calendarColumnStorage.ts`, `workspaceStateStorage.ts`
   - All schemas defined with Zod in `src/storage/schema.ts`
   - Stored per-workspace (not globally) using `context.workspaceState`
5. **UI** (`webview/src/`): React 19 + Tailwind 4 + @dnd-kit for drag-and-drop
   - **Two view tabs**: `KanbanView.tsx` (status-based columns) and `CalendarView.tsx` (date-based columns)
   - Each view has its own `DragDrop` wrapper: `KanbanDragDrop.tsx` and `CalendarDragDrop.tsx`

## Development Workflow

### Running the Extension

- **Start dev mode**: Task `dev` (parallel: `extension: watch` + `webview: dev`)
- **Test extension**: Press `F5` to launch Extension Development Host
- **Build for production**: `yarn vscode:prepublish` (compiles extension + builds webview)

### Making Changes

**Extension code changes:**
- Edit `src/**/*.ts`
- TypeScript compiler watch rebuilds automatically (via `extension: watch` task)
- Reload extension host window (`Ctrl+R` in Extension Development Host)

**Webview code changes:**
- Edit `webview/src/**/*`
- Vite HMR auto-updates (via `webview: dev` task, typically port 5173)
- No reload needed for most React changes

**Schema changes:**
1. Update schema in `src/storage/schema.ts` (Zod schema)
2. Update storage module (e.g., `todoStorage.ts`)
3. Update corresponding router procedures in `src/router/` (e.g., `todoRouter.ts`)
4. Types auto-propagate to webview via `AppRouter` type

### Critical File Path Rules

- **Extension imports**: Use `.js` extensions (e.g., `./storage/todoStorage.js`) despite `.ts` sources - **required for Node16 module resolution**
- **Webview resources**: Served from `webview/dist` after build, using `localResourceRoots` in webview options
- **Separate tsconfigs**: Extension and webview have independent `tsconfig.json` files - don't cross-compile

## Project-Specific Patterns

### RPC Communication Pattern

**Adding new RPC endpoints** (modular approach):
1. Add procedure to appropriate router file (e.g., `src/router/todoRouter.ts`):
   ```typescript
   myNewProcedure: procedure
     .input(z.object({ /* schema */ }))
     .resolve(async ({ input, ctx }) => {
       // Access ctx.vsContext for VSCode APIs
       // Call storage modules directly (e.g., todoStorage.getAllTodos(ctx.vsContext))
       return result;
     })
   ```
2. Export from `src/router/router.ts` if creating a new router namespace
3. Use in webview with full type safety:
   ```typescript
   const { data } = wrpc.useQuery("todo.myNewProcedure", input);
   // or
   const mutation = wrpc.useMutation("todo.myNewProcedure");
   ```

### Storage Pattern (Direct Workspace State)

**NOT a custom ORM** - direct use of VSCode's workspace state API:
```typescript
// Example from todoStorage.ts
export async function getAllTodos(context: vscode.ExtensionContext): Promise<Todo[]> {
  return context.workspaceState.get<Todo[]>("todos", []);
}

export async function saveTodo(context: vscode.ExtensionContext, todo: Todo): Promise<void> {
  const todos = await getAllTodos(context);
  todos.push(todo);
  await context.workspaceState.update("todos", todos);
}
```
- Each storage module exports simple CRUD functions
- IDs (UUIDs) and `createdAt` generated in router layer, not storage
- Validation happens in router via Zod schemas

### React Query Cache Invalidation

**Critical pattern for UI updates:**
- Use `useInvalidateTodos()` hook (from `webview/src/utils/invalidateTodos.ts`) after mutations
- This invalidates **all three** related queries: `todo.fetchTodos`, `kanban.fetchKanbanTodosByColumns`, `calendar.fetchCalendarTodosByColumns`
- Example:
  ```typescript
  const invalidateTodos = useInvalidateTodos();
  const mutation = wrpc.useMutation("todo.deleteTodo", {
    onSuccess: invalidateTodos,
  });
  ```

### Drag-and-Drop Architecture

**Two separate drag contexts:**
1. **KanbanDragDrop**: Moves todos between status columns (`todo`, `in-progress`, `done`)
   - Updates todo's `status` property when dropped in new column
   - Saves column order to `kanbanColumnStorage`
2. **CalendarDragDrop**: Moves todos between date columns (YYYY-MM-DD format)
   - Updates todo's `deadline` property when dropped on new date
   - Saves column order to `calendarColumnStorage`

**Critical bug fix pattern:**
- **Never update state from external sources during a drag** (e.g., `useEffect` that updates week/column state)
- This causes React to unmount/remount DOM nodes mid-drag, triggering `NotFoundError: Failed to execute 'removeChild'`
- **Solution**: Derive UI state from queries (not local state) or gate `useEffect` with `isDragging` flag

### Workspace State Persistence

Global UI state stored in `workspaceStateStorage`:
- `currentTab`: `"kanban" | "calendar"` - which tab is active
- `calendarWeek`: ISO datetime string - which week the calendar is showing

**Pattern for UI state:**
- Derive UI state from query results (not local `useState`)
- Update via mutation to persist changes
- Example from `CalendarView.tsx`:
  ```typescript
  const { data: workspaceState } = wrpc.useQuery("workspaceState.getWorkspaceState");
  const currentWeekStart = workspaceState?.calendarWeek
    ? dayjs(workspaceState.calendarWeek).startOf("week")
    : dayjs().startOf("week");
  ```

### Styling Conventions

- Tailwind 4 with custom semantic color variables (`text-text`, `bg-background`, `border-border`)
- Utility-first approach, no separate CSS modules
- `clsx` + `tailwind-merge` via `cn()` helper in `webview/src/utils/cn.ts`
- Component composition pattern: reusable components in `webview/src/components/`, view-specific in `webview/src/layout/`

### Code Quality

- **Linting/Formatting**: Biome (not ESLint/Prettier) - tab indentation, double quotes
- **Type Safety**: Strict TypeScript, Zod for runtime validation
- Extension and webview have separate `tsconfig.json` files (don't cross-compile)

## Common Tasks

**Add a new todo property:**
1. Update `todoSchema` in `src/storage/schema.ts`
2. Add mutation in appropriate router (e.g., `src/router/todoRouter.ts`)
3. Update UI in `webview/src/layout/TodoDetails.tsx`

**Add a new view tab:**
1. Add tab type to `TabId` in `webview/src/App.tsx`
2. Create view component in `webview/src/tabs/`
3. Update tab rendering logic in `App.tsx`
4. Optionally persist in `workspaceStateSchema`

**Debug RPC issues:**
- Check browser console in webview (right-click webview → "Open Webview Developer Tools")
- Check extension host logs in Debug Console
- Verify router procedure path matches webview query/mutation call

## External Dependencies

- `@webview-rpc/*`: Type-safe RPC with React Query adapter
- `@dnd-kit/react`: Headless drag-and-drop (separate providers for kanban/calendar)
- `react-day-picker` + `dayjs`: Date selection and manipulation
- `@vscode/codicons`: Icon font (served from node_modules, see `localResourceRoots`)
- `zod`: Runtime validation for all data flowing through RPC and storage
