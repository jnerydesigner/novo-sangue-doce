import { describe, expect, it } from "vitest";
import { SOCIAL_TEXT_MAX_CONTENT_CHARACTERS } from "../prompts/social-text.prompt";
import { normalizeTextResponse } from "./llm-text.gateway";

describe("normalizeTextResponse", () => {
  it("limits generated social content length", () => {
    const payload = {
      content: `${"Texto muito longo para publicacao social. ".repeat(80)}Final.`,
      hashtags: ["#Diabetes", "#Saude", "#Alimentacao", "#BemEstar", "#Glicemia", "#Extra"],
      shortTitle: "Resumo sobre diabetes",
    };

    const result = normalizeTextResponse(payload);

    expect(result.content.length).toBeLessThanOrEqual(SOCIAL_TEXT_MAX_CONTENT_CHARACTERS);
    expect(result.hashtags).toHaveLength(5);
  });
});
