export const runtimeConfig = {
  useMocks: import.meta.env.VITE_USE_MOCKS?.trim().toLowerCase() === "true",
} as const;
