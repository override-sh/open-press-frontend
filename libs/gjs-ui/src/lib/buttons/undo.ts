import { Button } from "grapesjs";

export const UndoButton: Button = {
	id: "undo",
	active: false,
	label: `<i class="ti ti-arrow-back-up"></i>`,
	command: "core:undo",
} as Button & { label: string };
