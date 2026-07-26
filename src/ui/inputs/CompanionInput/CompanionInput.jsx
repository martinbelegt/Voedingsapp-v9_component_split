import React, { forwardRef } from "react";

const baseInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 16,
  boxSizing: "border-box",
  WebkitAppearance: "none",
  appearance: "none",
};

function focusWithoutScroll(event) {
  const input = event.currentTarget;

  if (!input || typeof input.focus !== "function") return;

  const scrollElement = document.scrollingElement || document.documentElement;
  const scrollLeft = window.scrollX || scrollElement.scrollLeft || 0;
  const scrollTop = window.scrollY || scrollElement.scrollTop || 0;

  function restoreScrollPosition() {
    scrollElement.scrollLeft = scrollLeft;
    scrollElement.scrollTop = scrollTop;
    document.documentElement.scrollLeft = scrollLeft;
    document.documentElement.scrollTop = scrollTop;
    document.body.scrollLeft = scrollLeft;
    document.body.scrollTop = scrollTop;
    window.scrollTo(scrollLeft, scrollTop);
  }

  try {
    input.focus({ preventScroll: true });
    event.preventDefault();
  } catch {
    input.focus();
  }

  restoreScrollPosition();
  window.requestAnimationFrame?.(restoreScrollPosition);
}

export const CompanionInput = forwardRef(function CompanionInput(
  {
    type = "text",
    inputMode,
    autoComplete = "off",
    autoCorrect = "off",
    spellCheck = false,
    style,
    onPointerDown,
    onTouchStart,
    ...props
  },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      onPointerDown={(event) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          focusWithoutScroll(event);
        }

        onPointerDown?.(event);
      }}
      onTouchStart={(event) => {
        if (typeof PointerEvent !== "undefined") {
          onTouchStart?.(event);
          return;
        }

        focusWithoutScroll(event);
        onTouchStart?.(event);
      }}
      style={{
        ...baseInputStyle,
        ...style,
      }}
      {...props}
    />
  );
});

export const CompanionNumberInput = forwardRef(function CompanionNumberInput(
  { decimal = true, inputMode, pattern, ...props },
  ref,
) {
  return (
    <CompanionInput
      ref={ref}
      type="text"
      inputMode={inputMode || (decimal ? "decimal" : "numeric")}
      pattern={pattern ?? (decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*")}
      {...props}
    />
  );
});

export const CompanionSearchInput = forwardRef(function CompanionSearchInput(
  { inputMode = "search", ...props },
  ref,
) {
  return (
    <CompanionInput
      ref={ref}
      type="search"
      inputMode={inputMode}
      {...props}
    />
  );
});
