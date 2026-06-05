import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("react-i18next", () => {
	const translate = (
		key: string,
		defaultValue?: string | Record<string, unknown>,
		options?: Record<string, unknown>,
	) => {
		let template = key;
		let values: Record<string, unknown> | undefined;

		if (typeof defaultValue === "string") {
			template = defaultValue;
			values = options;
		} else if (defaultValue && typeof defaultValue === "object") {
			values = defaultValue;
		}

		return template.replace(/{{\s*(\w+)\s*}}/g, (_, token: string) => {
			const value = values?.[token];
			return value === undefined || value === null ? "" : String(value);
		});
	};

	return {
		useTranslation: () => ({
			t: translate,
			i18n: { resolvedLanguage: "en" },
		}),
	};
});


