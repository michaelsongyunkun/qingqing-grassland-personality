import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { dimensions, personalityTypes } from "../data/personality-test.ts";
import {
  buildShareCardSvg,
  getClosestPersonalityMatches,
  getDimensionInsight
} from "../lib/result-enhancements.ts";
import { getPersonalityVisualProfile } from "../lib/result-presentation.ts";

describe("result growth helpers", () => {
  it("returns the closest personality matches in distance order", () => {
    const matches = getClosestPersonalityMatches(
      { SE: 80, AC: 40, RB: -40, RV: 40, EE: 80 },
      3
    );

    assert.equal(matches.length, 3);
    assert.equal(matches[0]?.id, "grassland-sun");
    assert.ok(matches[0]!.distance <= matches[1]!.distance);
    assert.ok(matches[1]!.distance <= matches[2]!.distance);
  });

  it("explains a dimension score with the correct directional label", () => {
    const positive = getDimensionInsight("SE", 67);
    const neutral = getDimensionInsight("AC", 0);
    const negative = getDimensionInsight("EE", -52);

    assert.equal(positive.label, "群体发光");
    assert.equal(neutral.label, "弹性平衡");
    assert.equal(negative.label, "自我消化");
    assert.match(positive.description, /社交能量/);
    assert.match(negative.suggestion, /表达/);
  });

  it("builds a share card svg with escaped text and key result data", () => {
    const type = personalityTypes.find((item) => item.id === "grassland-sun");
    assert.ok(type);

    const svg = buildShareCardSvg({
      personality: { ...type, name: "草原太阳型 <测试>" },
      visualProfile: getPersonalityVisualProfile(type.id),
      scores: { SE: 80, AC: 40, RB: -40, RV: 40, EE: 80 },
      modeLabel: "专业版 · 完整 30 题",
      dimensions
    });

    assert.match(svg, /<svg/);
    assert.match(svg, /草原太阳型 &lt;测试&gt;/);
    assert.match(svg, /专业版 · 完整 30 题/);
    assert.match(svg, /社交能量/);
    assert.match(svg, /娱乐自测/);
  });
});
