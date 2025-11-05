import type { ReactNode } from "react";

interface PropertyProps {
	logoname?: string;
	propertyname: string;
	children: ReactNode;
}

export function Property({ logoname, propertyname, children }: PropertyProps) {
	return (
		<div className="flex flex-row gap-2">
			<div className="flex items-center gap-2">
				{logoname && (
					<i className={`codicon ${logoname} text-muted-text text-sm`} />
				)}
				<h3 className="text-xs uppercase tracking-wide text-muted-text font-semibold">
					{propertyname}
				</h3>
			</div>
			<div className="ml-6">{children}</div>
		</div>
	);
}
