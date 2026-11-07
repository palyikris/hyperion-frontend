import { describe, expect, it } from "vitest";
import { createLoginSchema, createSignupSchema } from "./auth/auth";
import { createSettingsSchema } from "./settings/settings";

const t = (key: string) => key;
const credentials = { email: "user@example.test", password: "  password123  " };
const nameSchemas = [
  {
    name: "signup",
    schema: createSignupSchema(t),
    data: credentials,
    error: "auth.validation.fullNameRequired",
  },
  {
    name: "settings",
    schema: createSettingsSchema(t),
    data: { language: "hu" },
    error: "settings.validation.fullNameRequired",
  },
];

describe.each(nameSchemas)("$name name validation", ({ schema, data, error }) => {
  it.each(["", "   ", "\t\n", "\u00a0"])("rejects blank names: %j", (full_name) => {
    const result = schema.safeParse({ ...data, full_name });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({ path: ["full_name"], message: error });
    }
  });

  it("trims surrounding whitespace without changing the name's internal spacing", () => {
    const result = schema.parse({ ...data, full_name: "  Árvíztűrő  Tükörfúrógép \t" });
    expect(result.full_name).toBe("Árvíztűrő  Tükörfúrógép");
  });
});

describe("settings language validation", () => {
  const schema = createSettingsSchema(t);

  it.each(["en", "hu"])("accepts the supported language %s", (language) => {
    expect(schema.parse({ full_name: "Test User", language }).language).toBe(language);
  });

  it.each(["de", "fr", "HU", "en-US", " hu ", "   "])(
    "rejects the unsupported language %j with a translated message",
    (language) => {
      const result = schema.safeParse({ full_name: "Test User", language });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]).toMatchObject({
          path: ["language"], message: "settings.validation.languageUnsupported",
        });
      }
    },
  );

  it.each(["", undefined, null])("reports a required error for missing language %j", (language) => {
    const result = schema.safeParse({ full_name: "Test User", language });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toMatchObject({
        path: ["language"], message: "settings.validation.languageRequired",
      });
    }
  });
});

it("does not trim passwords during login or signup", () => {
  expect(createLoginSchema(t).parse(credentials).password).toBe(credentials.password);
  expect(createSignupSchema(t).parse({ ...credentials, full_name: "Test User" }).password)
    .toBe(credentials.password);
});
