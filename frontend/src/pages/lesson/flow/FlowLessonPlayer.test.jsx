import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
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

afterEach(() => {
  vi.useRealTimers();
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
  expect(
    screen.queryByText(/Liệu có một quy luật tự nhiên/i),
  ).not.toBeInTheDocument();
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

test("sequential groups show one child at a time and do not keep stale next buttons", async () => {
  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [
          {
            id: "social-role-experience",
            type: "component_group",
            title: "...khi phương thức sản xuất thay đổi...",
            config: {
              revealMode: "sequential",
              completionMode: "all",
              components: [
                {
                  id: "social-setup",
                  type: "dialogue",
                  title: "...khi phương thức sản xuất thay đổi...",
                  config: {
                    lines: [
                      {
                        who: "guide",
                        text: "Bối cảnh: nhiều thế hệ trôi qua.",
                      },
                    ],
                  },
                },
                {
                  id: "social-borin-dialogue",
                  type: "dialogue",
                  title: "Một ngày của Borin",
                  config: {
                    lines: [
                      {
                        who: "slave",
                        text: "Trời chưa sáng, tôi đã phải ra đồng cày cuốc.",
                      },
                    ],
                  },
                },
                {
                  id: "social-role-slave",
                  type: "mcq",
                  title: "Vai 1",
                  config: {
                    question: "Borin có thời gian suy ngẫm không?",
                    options: [
                      { id: "a", text: "Không.", isCorrect: true },
                      { id: "b", text: "Có.", isCorrect: false },
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

  expect(screen.getByText(/Bối cảnh: nhiều thế hệ/i)).toBeInTheDocument();
  expect(screen.queryByText(/Trời chưa sáng/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  expect(await screen.findByText(/Trời chưa sáng/i)).toBeInTheDocument();
  expect(screen.queryByText(/Bối cảnh: nhiều thế hệ/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  expect(
    await screen.findByText(/Borin có thời gian suy ngẫm không/i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Trời chưa sáng/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /^Không\.$/i }));

  expect(screen.getAllByRole("button", { name: /Tiếp tục/i })).toHaveLength(1);
});

test("auto-revealed dialogue keeps the final continue action available", () => {
  vi.useFakeTimers();

  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [
          {
            id: "dialogue-auto",
            type: "dialogue",
            title: "Đối thoại tự hiện",
            config: {
              lines: [
                {
                  who: "guide",
                  text: "Dòng thoại đầu tiên.",
                },
                {
                  who: "skeptic",
                  text: "Dòng thoại thứ hai tự xuất hiện.",
                },
              ],
            },
          },
        ],
        progress: [{ currentComponentIndex: 0, completedComponentIds: [] }],
      }}
    />,
  );

  expect(screen.getByText("Dòng thoại đầu tiên.")).toBeInTheDocument();
  expect(
    screen.queryByText("Dòng thoại thứ hai tự xuất hiện."),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Tiếp tục/i }),
  ).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1300);
  });

  expect(
    screen.getByText("Dòng thoại thứ hai tự xuất hiện."),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/i }));

  const lastCall = mutationMock.mutate.mock.calls.at(-1)?.[0];
  expect(lastCall?.payload?.completedComponentIds).toContain("dialogue-auto");
  expect(lastCall?.payload?.componentResult).toMatchObject({
    componentId: "dialogue-auto",
    type: "dialogue",
    status: "completed",
  });
});

test("multi-line social dialogue reveals all lines and keeps next visible", () => {
  vi.useFakeTimers();

  render(
    <FlowLessonPlayer
      nodeDetails={{
        id: "node-1",
        lessonFlow: [
          {
            id: "social-setup",
            type: "dialogue",
            title: "Đại hội bộ tộc",
            config: {
              characters: {
                guide: { name: "Sophia", role: "Người dẫn truyện" },
                slave: { name: "Borin", role: "Người lao động chân tay" },
                noble: { name: "Theon", role: "Quý tộc / trí thức" },
              },
              lines: [
                {
                  who: "guide",
                  text: "Nhiều thế hệ trôi qua, con người biết rèn đồng, rèn sắt.",
                },
                {
                  who: "slave",
                  text: "Trời chưa sáng, tôi đã phải ra đồng cày cuốc, vác đá xây tháp tới kiệt sức.",
                },
                {
                  who: "noble",
                  text: "Tôi có của cải dư thừa, không phải lao động chân tay.",
                },
              ],
            },
          },
        ],
        progress: [{ currentComponentIndex: 0, completedComponentIds: [] }],
      }}
    />,
  );

  expect(screen.getByText(/Nhiều thế hệ trôi qua/i)).toBeInTheDocument();
  expect(screen.queryByText(/Trời chưa sáng/i)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Tiếp tục/i }),
  ).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1300);
  });

  expect(screen.getByText(/Trời chưa sáng/i)).toBeInTheDocument();
  expect(screen.queryByText(/Tôi có của cải dư thừa/i)).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Tiếp tục/i }),
  ).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1300);
  });

  expect(screen.getByText(/Tôi có của cải dư thừa/i)).toBeInTheDocument();

  const nextButton = screen.getByRole("button", { name: /Tiếp tục/i });
  expect(nextButton).toBeInTheDocument();
  fireEvent.click(nextButton);

  const lastCall = mutationMock.mutate.mock.calls.at(-1)?.[0];
  expect(lastCall?.payload?.completedComponentIds).toContain("social-setup");
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
