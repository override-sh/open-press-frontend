import { Button } from "grapesjs";

export const PreviewButton: Button = {
	id: "preview",
	active: false,
	label: `<i class="ti ti-view-360"></i>`,
	command: "core:preview",
} as Button & { label: string };
