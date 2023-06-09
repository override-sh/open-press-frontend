"use client";

/* istanbul ignore file */

import { useEffect } from "react";
import { useScrollPosition } from "./use-scroll-position";

export const useTranslateElementOnScroll = (query_selector: string) => {
	const scroll_position = useScrollPosition();

	useEffect(() => {
		const element = document.querySelector(query_selector) as HTMLElement | null;

		if (element) {
			const updatePosition = () => {
				element.style.transform = `translateY(${scroll_position}px)`;
			};

			window.addEventListener("scroll", updatePosition);
			updatePosition();

			return () => window.removeEventListener("scroll", updatePosition);
		}
	});
};
