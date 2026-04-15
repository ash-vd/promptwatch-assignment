import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FilterBar } from "../FilterBar";
import type { Filters, FilterOptions } from "../types";

type FilterBarProps = ComponentProps<typeof FilterBar>;

const emptyFilters: Filters = {
  aiModel: "",
  sentiment: "",
  region: "",
  category: "",
  search: "",
};

const options: FilterOptions = {
  aiModels: ["gpt-4", "claude"],
  sentiments: ["positive", "negative", "neutral"],
  regions: ["US", "EU"],
  categories: ["marketing", "support"],
};

const renderFilterBar = (overrides: Partial<FilterBarProps> = {}) => {
  const onChange = vi.fn();
  const onReset = vi.fn();

  render(
    <FilterBar
      filters={emptyFilters}
      options={options}
      hasActiveFilters={false}
      onChange={onChange}
      onReset={onReset}
      {...overrides}
    />,
  );

  return { onChange, onReset };
};

describe("<FilterBar />", () => {
  it("renders the search input with the current value", () => {
    renderFilterBar({
      filters: { ...emptyFilters, search: "claude" },
    });

    expect(screen.getByLabelText("Search URLs or titles")).toHaveValue(
      "claude",
    );
  });

  it("calls onChange with the 'search' key as the user types", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFilterBar();

    const input = screen.getByLabelText("Search URLs or titles");
    await user.type(input, "ab");

    expect(onChange).toHaveBeenNthCalledWith(1, "search", "a");
    expect(onChange).toHaveBeenNthCalledWith(2, "search", "b");
  });

  it("hides the reset button when no filters are active", () => {
    renderFilterBar({ hasActiveFilters: false });

    expect(
      screen.queryByRole("button", { name: /reset/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the reset button and triggers onReset when active filters exist", async () => {
    const user = userEvent.setup();
    const { onReset } = renderFilterBar({ hasActiveFilters: true });

    const resetButton = screen.getByRole("button", { name: /reset/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders a select trigger for each of the four filter dimensions, defaulting to the 'all' option", () => {
    renderFilterBar();

    const triggers = screen.getAllByRole("combobox");
    expect(triggers).toHaveLength(4);
    expect(triggers[0]).toHaveTextContent("All models");
    expect(triggers[1]).toHaveTextContent("All sentiment");
    expect(triggers[2]).toHaveTextContent("All regions");
    expect(triggers[3]).toHaveTextContent("All categories");
  });

  it("displays the currently selected filter values in their triggers", () => {
    renderFilterBar({
      filters: { ...emptyFilters, aiModel: "gpt-4", sentiment: "positive" },
    });

    const [aiModelTrigger, sentimentTrigger] = screen.getAllByRole("combobox");
    expect(aiModelTrigger).toHaveTextContent("gpt-4");
    expect(sentimentTrigger).toHaveTextContent(/positive/i);
  });
});
