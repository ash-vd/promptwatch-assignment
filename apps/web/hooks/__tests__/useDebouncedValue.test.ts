import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue()", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("returns the initial value synchronously on first render", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before the delay has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe("a");
  });

  it("updates to the latest value once the delay has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("b");
  });

  it("resets the timer on rapid successive changes and only commits the latest value", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "c" });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("c");
  });

  it("re-debounces when the delay prop changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebouncedValue(value, delay),
      { initialProps: { value: "a", delay: 300 } },
    );

    rerender({ value: "b", delay: 1000 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current).toBe("b");
  });

  it("cancels pending updates when the component unmounts", () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    unmount();

    expect(() => {
      vi.advanceTimersByTime(300);
    }).not.toThrow();
    expect(result.current).toBe("a");
  });
});
