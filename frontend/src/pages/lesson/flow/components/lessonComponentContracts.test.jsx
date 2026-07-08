import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ComponentImage } from "./ComponentImage";
import {
  buildExpectedMatches,
  isMatchingColumnsComplete,
} from "./MatchingColumnsComponent";
import { ShinkeiMatchingComponent } from "./ShinkeiMatchingComponent";

afterEach(() => {
  vi.useRealTimers();
});

test("ComponentImage applies free-form display sizing from image metadata", () => {
  render(
    <ComponentImage
      image={{
        url: "/public/lesson-assets/example.png",
        alt: "Sơ đồ minh họa",
        fit: "contain",
        position: "top center",
        width: 240,
        height: "12rem",
        size: { maxWidth: "80%", aspectRatio: "4 / 3" },
      }}
    />,
  );

  const image = screen.getByAltText("Sơ đồ minh họa");
  expect(image).toHaveStyle({
    objectFit: "contain",
    objectPosition: "top center",
  });
  expect(image.closest("figure")).toHaveStyle({
    width: "240px",
    height: "12rem",
    maxWidth: "80%",
    aspectRatio: "4 / 3",
  });
});

test("matching columns accept many left cards matched to one right card", () => {
  const expected = buildExpectedMatches([
    { leftIds: ["socrates", "plato"], rightId: "greek" },
  ]);

  expect(
    isMatchingColumnsComplete(
      [{ id: "socrates" }, { id: "plato" }],
      { socrates: "greek", plato: "greek" },
      expected,
    ),
  ).toBe(true);
});

test("Shinkei matching flips image cards, resets wrong choices, and completes pairs", () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();

  render(
    <ShinkeiMatchingComponent
      component={{
        id: "memory-1",
        title: "Ghép thẻ ký ức",
        type: "shinkei_matching",
        config: {
          shuffle: false,
          pairs: [
            {
              id: "p1",
              left: {
                id: "left-1",
                text: "Socrates",
                image: { url: "/socrates.png", alt: "Socrates" },
              },
              right: {
                id: "right-1",
                text: "Đối thoại phản biện",
                image: { url: "/dialogue.png", alt: "Đối thoại" },
              },
            },
            {
              id: "p2",
              left: { id: "left-2", text: "Plato" },
              right: { id: "right-2", text: "Thế giới ý niệm" },
            },
          ],
        },
      }}
      onComplete={onComplete}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: /Socrates/i }));
  fireEvent.click(screen.getByRole("button", { name: /Thế giới ý niệm/i }));
  expect(screen.getByRole("button", { name: /Socrates/i })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByRole("button", { name: /Socrates/i })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  fireEvent.click(screen.getByRole("button", { name: /Socrates/i }));
  fireEvent.click(screen.getByRole("button", { name: /Đối thoại phản biện/i }));
  fireEvent.click(screen.getByRole("button", { name: /Plato/i }));
  fireEvent.click(screen.getByRole("button", { name: /Thế giới ý niệm/i }));

  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  expect(onComplete).toHaveBeenCalledWith({
    score: 100,
    answer: { matchedPairIds: ["p1", "p2"] },
    status: "completed",
  });
});
