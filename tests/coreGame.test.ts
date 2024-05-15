import { GameService } from "../services/game.service";

//isYams
test("returns true when the combo is a Yams", () => {
  const combo = [2, 2, 2, 2, 2];
  const isYams = GameService.isYams(combo);
  expect(isYams).toBe(true);
});

test("returns false when its not a Yams", () => {
  const combo = [2, 2, 4, 5, 6];
  const isNotYams = GameService.isYams(combo);
  expect(isNotYams).toBe(false);
});

// isSquare
test("returns true when the combo is a square", () => {
  const combo = [2, 2, 2, 2, 6];
  const isSquare = GameService.isSquared(combo);
  expect(isSquare).toBe(true);
});

test("returns false when its not a squared", () => {
  const combo = [2, 2, 4, 5, 6];
  const isNotSquare = GameService.isSquared(combo);
  expect(isNotSquare).toBe(false);
});

// isDouble
test("returns true when the combo is a double", () => {
  const combo = [2, 2, 4, 4, 6];
  const isDouble = GameService.isDouble(combo);
  expect(isDouble).toBe(true);
});

test("returns false when its not a double", () => {
  const combo = [2, 2, 4, 5, 6];
  const isNotDouble = GameService.isDouble(combo);
  expect(isNotDouble).toBe(false);
});
