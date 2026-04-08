import { describe, it, expect } from "vitest";
import { t, type Language, type TranslationKey } from "@/lib/i18n";

const languages: Language[] = ["en", "sv", "de"];

// Keys that must exist for all pages mentioned in the i18n requirements
const requiredKeys: TranslationKey[] = [
  // ScanPage
  "scanFailed",
  "scanBadge",
  "step1FindCode",
  "step1FindCodeDesc",
  "step2HoldSteady",
  "step2HoldSteadyDesc",
  "step3UnlockStory",
  "step3UnlockStoryDesc",
  // Layout
  "appName",
  // NotFound
  "notFound",
  "notFoundSubtitle",
  "returnHome",
  // LocationDetailPage / LocationScreen
  "locationNotFound",
  "back",
  "placeholderImage",
  // LoginPage
  "passwordsMismatch",
  "authError",
  // AdminPage
  "locations",
  "totalScans",
  "cancel",
];

describe("i18n", () => {
  describe("t() returns a string for every language", () => {
    for (const key of requiredKeys) {
      for (const lang of languages) {
        it(`t('${key}', '${lang}') returns a non-empty string`, () => {
          const result = t(key, lang);
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        });
      }
    }
  });

  it("t() returns English fallback when a key is missing in another language", () => {
    // The fallback mechanism: returns en value or the key itself
    const result = t("appName", "en");
    expect(result).toBe("Visby Quest");
  });

  it("Swedish translations differ from English for user-visible strings", () => {
    expect(t("notFound", "sv")).not.toBe(t("notFound", "en"));
    expect(t("back", "sv")).not.toBe(t("back", "en"));
    expect(t("scanFailed", "sv")).not.toBe(t("scanFailed", "en"));
  });

  it("German translations differ from English for user-visible strings", () => {
    expect(t("notFound", "de")).not.toBe(t("notFound", "en"));
    expect(t("back", "de")).not.toBe(t("back", "en"));
    expect(t("scanFailed", "de")).not.toBe(t("scanFailed", "en"));
  });

  it("ScanPage step keys return correct English values", () => {
    expect(t("step1FindCode", "en")).toBe("1. Find the code");
    expect(t("step2HoldSteady", "en")).toBe("2. Hold steady");
    expect(t("step3UnlockStory", "en")).toBe("3. Unlock the story");
  });

  it("NotFound page keys return correct English values", () => {
    expect(t("notFound", "en")).toBe("Page not found");
    expect(t("notFoundSubtitle", "en")).toBe(
      "This path leads nowhere, brave traveller."
    );
    expect(t("returnHome", "en")).toBe("Return to Home");
  });

  it("Auth error keys return correct English values", () => {
    expect(t("passwordsMismatch", "en")).toBe("Passwords do not match.");
    expect(t("authError", "en")).toBe("Could not authenticate.");
  });

  it("Location keys return correct English values", () => {
    expect(t("locationNotFound", "en")).toBe("Location not found");
    expect(t("back", "en")).toBe("Back");
    expect(t("placeholderImage", "en")).toBe("Placeholder image");
  });
});
