import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FilterSelect } from "../FilterSelect";

type FilterSelectProps = ComponentProps<typeof FilterSelect>;

const renderFilterSelect = (overrides: Partial<FilterSelectProps> = {}) => {
  const onChange = vi.fn();

  render(
    <FilterSelect
      value=""
      options={["gpt-4", "claude"]}
      allLabel="All models"
      placeholder="AI Model"
      onChange={onChange}
      {...overrides}
    />,
  );

  return { onChange };
};

describe("<FilterSelect />", () => {
  it("shows the 'all' label on the trigger when no value is selected", () => {
    renderFilterSelect({ value: "" });

    expect(screen.getByRole("combobox")).toHaveTextContent("All models");
  });

  it("shows the selected value on the trigger when one is set", () => {
    renderFilterSelect({ value: "gpt-4" });

    expect(screen.getByRole("combobox")).toHaveTextContent("gpt-4");
  });

  it("formats the trigger label through formatOption when provided", () => {
    renderFilterSelect({
      value: "positive",
      options: ["positive", "negative"],
      formatOption: (v) => v.toUpperCase(),
    });

    expect(screen.getByRole("combobox")).toHaveTextContent("POSITIVE");
  });

  it("renders every option (plus the 'all' entry) when opened", async () => {
    const user = userEvent.setup();
    renderFilterSelect({ options: ["gpt-4", "claude"] });

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "All models" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "gpt-4" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "claude" })).toBeInTheDocument();
  });

  it("calls onChange with the option value when a concrete option is selected", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterSelect();

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "gpt-4" }));

    expect(onChange).toHaveBeenCalledWith("gpt-4");
  });

  it("calls onChange with an empty string when the 'all' option is selected", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterSelect({ value: "gpt-4" });

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "All models" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("applies formatOption to every rendered option label", async () => {
    const user = userEvent.setup();
    renderFilterSelect({
      options: ["positive", "negative"],
      formatOption: (v) => v.toUpperCase(),
    });

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "POSITIVE" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "NEGATIVE" })).toBeInTheDocument();
  });

  it("still renders the 'all' entry when options is undefined", async () => {
    const user = userEvent.setup();
    renderFilterSelect({ options: undefined });

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "All models" })).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(1);
  });
});
