import { buildStoryAssetPayload, toStoryAssetKind } from "./adapters";

it("maps director object kinds to StoryAI asset buckets", () => {
  expect(toStoryAssetKind("character")).toBe("characters");
  expect(toStoryAssetKind("scene")).toBe("scenes");
  expect(toStoryAssetKind("prop")).toBe("props");
});

it("builds a StoryAI-compatible payload from a director asset", () => {
  expect(
    buildStoryAssetPayload({
      kind: "character",
      name: "Character A",
      description: "Blue character",
      imageUrl: "blob:char",
    })
  ).toEqual({
    bucket: "characters",
    item: {
      name: "Character A",
      description: "Blue character",
      imageUrl: "blob:char",
    },
  });
});
