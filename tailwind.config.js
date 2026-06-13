/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  // The app passes a few utility classes dynamically (modal widths, grid columns).
  // They already appear as string literals in the source, but we safelist them
  // explicitly so the JIT never purges them.
  safelist: [
    "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-3xl", "max-w-4xl",
    "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4", "grid-cols-5",
    "col-span-1", "col-span-2", "col-span-3", "col-span-4",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
