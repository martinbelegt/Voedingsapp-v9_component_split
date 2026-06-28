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

  try {
    input.focus({ preventScroll: true });
    event.preventDefault();
  } catch {
    input.focus();
  }
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
  { decimal = true, inputMode, ...props },
  ref,
) {
  return (
    <CompanionInput
      ref={ref}
      type="text"
      inputMode={inputMode || (decimal ? "decimal" : "numeric")}
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
