import { CONFIG } from "@aetheria/frontend-common";
import { TemplateRenderingEntity } from "@aetheria/frontend-interfaces";
import Script from "next/script";

interface Params {
	path?: string[];
	path_first_segment: string;
}

interface Props {
	params: Params;
}

async function getData(path: string): Promise<TemplateRenderingEntity> {
	const response = await fetch(`${CONFIG.ssr_backend_url}/template/render/${path}`, {
		next: {
			tags: ["template", path],
		},
	});

	if (!response.ok) {
		console.warn(response.statusText);
	}

	return await response.json();
}

/**
 * This page can be seen as a `relative catch-all` basically meaning that will catch all routes from root on except for
 * the one specifically defined in the root path (see the example with the admin routes).
 *
 * This particular behaviours is achieved by prefixing the `optional catch-all` path with a `dynamic segment`
 * that automatically handles path on the same route folder.
 *
 * The achieved behaviour differs from the one that will be achieved by using only an `optional catch-all` route at the
 * root because of what we name "specificity" levels assigned to paths.
 *
 * Here are the current specificity levels of next 13:
 *  - optional catch all: {specificity: 0} - catch all routes doesn't matter if they are dynamic or not
 *  - standard routes with pages and layouts: {specificity: 1} - standard routes are routes that are not dynamic with
 * layouts, pages etc.
 *  - dynamic routes: {specificity: 2} - one (or more) dynamic segment(s) in the path but no optional catch-all, always
 * have at least a page
 *
 * The wrap of the `optional catch-all` route ensures that top level standard routes have always a higher priority on
 * the catch-all segment, allowing to achieve the following behaviour:
 *  - standard routes:
 *      - {path: "/", handler: "page.tsx", relative_catch_all: false}
 *      - {path: "/admin", handler: "admin/page.tsx", relative_catch_all: false}
 *      - {path: "/admin/dashboard", handler: "admin/dashboard/page.tsx", relative_catch_all: false}
 *
 *  - optional catch-all routes:
 *      - {path: "/sample", handler: "[path_first_segment]/[[...path]]/page.tsx", relative_catch_all: true}
 *      - {path: "/sample/fragment", handler: "[path_first_segment]/[[...path]]/page.tsx", relative_catch_all: true}
 *      - {path: "/sample/fragment/sub/path/with/multiple/levels", handler: "[path_first_segment]/[[...path]]/page.tsx",
 * relative_catch_all: true}
 *
 * @param params
 * @constructor
 */
export default async function Page({ params }: Props) {
	const { path, path_first_segment } = params;

	const navigation_path = path ? [path_first_segment, ...path].join("%2F") : path_first_segment;

	const data = await getData(navigation_path);

	const extracted_body_id = /<body\s*[^>]+id=(\w+)\s*[^>]*>/gm.exec(data.html);
	const body_id = extracted_body_id && extracted_body_id.length === 1 ? extracted_body_id[0] : undefined;

	return (
		<>
			<style>{data.css}</style>
			<main
				id={body_id}
				dangerouslySetInnerHTML={{ __html: data.html }}
			></main>
			{data.scripts && (
				<Script
					id={"home_script"}
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{ __html: data.scripts }}
				/>
			)}
		</>
	);
}
