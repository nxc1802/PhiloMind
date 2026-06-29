import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import FlowLessonPlayer from "./FlowLessonPlayer";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("../../../hooks/useMutations", () => ({
  useUpdateComponentProgressMutation: () => ({
    mutate: vi.fn(),
  }),
}));

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
