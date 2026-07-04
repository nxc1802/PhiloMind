import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import FlowLessonPlayer from "./FlowLessonPlayer";

const mutationMock = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("../../../hooks/useMutations", () => ({
  useUpdateComponentProgressMutation: () => ({
    mutate: mutationMock.mutate,
    isPending: false,
  }),
}));

beforeEach(() => {
  mutationMock.mutate.mockClear();
});

test("renders a fallback instead of crashing when a lesson flow component has no type", () => {
  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [{ id: "broken-component", title: "Dữ liệu thiếu type" }],
        progress: [{ currentComponentIndex: 4, completedComponentIds: [] }],
      }}
    />,
  );

  expect(screen.getAllByText(/Dữ liệu thiếu type/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Component type "unsupported"/i)).toBeInTheDocument();
});

test("renders grouped lesson components sequentially in the right column", async () => {
  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [
          {
            id: "dialogue-checkpoint",
            type: "component_group",
            title: "Bước ngoặt hoài nghi",
            config: {
              revealMode: "sequential",
              completionMode: "all",
              components: [
                {
                  id: "lyra-doubt",
                  type: "dialogue",
                  title: "Bước ngoặt hoài nghi",
                  config: {
                    lines: [
                      {
                        who: "skeptic",
                        text: "Liệu có một quy luật tự nhiên nào đó không?",
                      },
                    ],
                  },
                },
                {
                  id: "cognitive-shift-quiz",
                  type: "mcq",
                  title: "Nhận thức",
                  config: {
                    question: "Câu hỏi của Lyra hé lộ điều gì?",
                    options: [
                      {
                        id: "a",
                        text: "Tìm quy luật và lý lẽ.",
                        isCorrect: true,
                      },
                      {
                        id: "b",
                        text: "Tế lễ nhiều hơn.",
                        isCorrect: false,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        progress: [{ currentComponentIndex: 0, completedComponentIds: [] }],
      }}
    />,
  );

  expect(
    screen.getByText(/Liệu có một quy luật tự nhiên/i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Câu hỏi của Lyra/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  expect(await screen.findByText(/Câu hỏi của Lyra/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Tìm quy luật/i }));
  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  await waitFor(() => {
    const lastCall = mutationMock.mutate.mock.calls.at(-1)?.[0];
    expect(lastCall?.payload?.completedComponentIds).toContain(
      "dialogue-checkpoint",
    );
    expect(lastCall?.payload?.componentResult).toMatchObject({
      componentId: "dialogue-checkpoint",
      type: "component_group",
      status: "completed",
      childResults: [
        { componentId: "lyra-doubt", type: "dialogue", status: "completed" },
        {
          componentId: "cognitive-shift-quiz",
          type: "mcq",
          status: "completed",
        },
      ],
    });
  });
});

test("restored grouped progress keeps the group in one frame and can continue", async () => {
  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [
          {
            id: "dialogue-checkpoint",
            type: "component_group",
            title: "Bước ngoặt hoài nghi",
            config: {
              revealMode: "sequential",
              completionMode: "all",
              components: [
                {
                  id: "lyra-doubt",
                  type: "dialogue",
                  title: "Bước ngoặt hoài nghi",
                  config: {
                    lines: [
                      {
                        who: "skeptic",
                        text: "Liệu có một quy luật tự nhiên nào đó không?",
                      },
                    ],
                  },
                },
                {
                  id: "cognitive-shift-quiz",
                  type: "mcq",
                  title: "Nhận thức",
                  config: {
                    question: "Câu hỏi của Lyra hé lộ điều gì?",
                    options: [
                      {
                        id: "a",
                        text: "Tìm quy luật và lý lẽ.",
                        isCorrect: true,
                      },
                      {
                        id: "b",
                        text: "Tế lễ nhiều hơn.",
                        isCorrect: false,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
        progress: [
          {
            currentComponentIndex: 0,
            completedComponentIds: ["lyra-doubt", "cognitive-shift-quiz"],
            componentResults: [
              {
                componentId: "lyra-doubt",
                type: "dialogue",
                status: "completed",
              },
              {
                componentId: "cognitive-shift-quiz",
                type: "mcq",
                answer: "a",
                status: "completed",
              },
            ],
          },
        ],
      }}
    />,
  );

  expect(screen.queryByText(/component group/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Hoàn thành$/i)).not.toBeInTheDocument();

  const restoredAnswer = screen.getByRole("button", {
    name: /Tìm quy luật/i,
  });
  expect(
    within(restoredAnswer).getByText("radio_button_unchecked"),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  await waitFor(() => {
    const lastCall = mutationMock.mutate.mock.calls.at(-1)?.[0];
    expect(lastCall?.payload?.completedComponentIds).toContain(
      "dialogue-checkpoint",
    );
  });
});
