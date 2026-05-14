export function scrollRefIntoView(ref, delay = 80) {
  setTimeout(
    () =>
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    delay,
  );
}
