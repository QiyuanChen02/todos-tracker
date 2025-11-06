import type * as vscode from "vscode";
import { z } from "zod";

/**
 * Type-safe workspace state manager inspired by Prisma
 * Always stores data as an array of items with an 'id' field
 */
export class WorkspaceStateManager<
	TSchema extends z.ZodObject<{ id: z.ZodType<string> }>,
> {
	constructor(
		private readonly context: vscode.ExtensionContext,
		private readonly key: string,
		private readonly schema: TSchema,
	) {}

	/**
	 * Find and retrieve all items from workspace state
	 */
	async findMany(): Promise<z.infer<TSchema>[]> {
		const data = this.context.workspaceState.get<unknown[]>(this.key, []);
		return z.array(this.schema).parse(data);
	}

	/**
	 * Find item by id
	 */
	async findById(id: string): Promise<z.infer<TSchema> | null> {
		const data = await this.findMany();
		return data.find((item) => item.id === id) ?? null;
	}

	/**
	 * Create or replace all data in workspace state
	 */
	async upsert(data: z.infer<TSchema>[]): Promise<z.infer<TSchema>[]> {
		const validated = z.array(this.schema).parse(data);
		await this.context.workspaceState.update(this.key, validated);
		return validated;
	}

	/**
	 * Create a new item (generates id if not provided, and createdAt if schema has it)
	 */
	async create(
		item: Omit<z.infer<TSchema>, "id" | "createdAt"> & {
			id?: string;
			createdAt?: string;
		},
	): Promise<z.infer<TSchema>> {
		const data = await this.findMany();

		const shape = this.schema.shape;
		const newItem: Record<string, unknown> = { ...item };

		// Generate id if not provided
		if (!("id" in newItem) || !newItem.id) {
			newItem.id = crypto.randomUUID();
		}

		// Generate createdAt if schema has it and not provided
		if ("createdAt" in shape && !("createdAt" in newItem)) {
			newItem.createdAt = new Date().toISOString();
		}

		const parsedItem = this.schema.parse(newItem);

		data.push(parsedItem);
		await this.upsert(data);
		return parsedItem;
	}

	/**
	 * Update item by id (fails if not found)
	 */
	async updateById(
		id: string,
		item: z.infer<TSchema>,
	): Promise<z.infer<TSchema> | null> {
		const data = await this.findMany();
		const index = data.findIndex((i) => i.id === id);

		if (index === -1) {
			return null;
		}

		const updatedItem = this.schema.parse({ ...data[index], ...item });
		data[index] = updatedItem;

		await this.upsert(data);
		return updatedItem;
	}

	/**
	 * Delete item by id
	 */
	async deleteById(id: string): Promise<boolean> {
		const data = await this.findMany();
		const index = data.findIndex((item) => item.id === id);

		if (index === -1) {
			return false;
		}

		data.splice(index, 1);
		await this.upsert(data);
		return true;
	}

	/**
	 * Delete all data from workspace state
	 */
	async deleteAll(): Promise<void> {
		await this.context.workspaceState.update(this.key, []);
	}

	/**
	 * Count items
	 */
	async count(): Promise<number> {
		const data = await this.findMany();
		return data.length;
	}
}

type SchemaMap = Record<string, z.ZodObject<{ id: z.ZodType<string> }>>;

export type Database<T extends SchemaMap> = {
	[K in keyof T]: WorkspaceStateManager<T[K]>;
};

/**
 * Create a database with multiple tables from a schema map
 */
export function createDatabase<T extends SchemaMap>(
	context: vscode.ExtensionContext,
	schemas: T,
): Database<T> {
	const db = {} as Database<T>;

	for (const [key, schema] of Object.entries(schemas)) {
		db[key as keyof T] = new WorkspaceStateManager(
			context,
			key,
			schema as T[keyof T],
		);
	}

	return db;
}
