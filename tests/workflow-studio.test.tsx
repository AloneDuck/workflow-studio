import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WorkflowStudio } from "@/components/WorkflowStudio";
import { sampleWorkflow } from "@/data/sample-workflow";

describe("WorkflowStudio", () => {
  it("adds a field and restores the prior schema with undo", async () => {
    const user = userEvent.setup();
    render(<WorkflowStudio initialWorkflow={sampleWorkflow} />);
    await user.click(screen.getByRole("button", { name: "Add number field" }));
    expect(screen.getAllByText("New number field")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Undo last change" }));
    expect(screen.queryAllByText("New number field")).toHaveLength(0);
  });
});
