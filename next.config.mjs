/** @type {import('next').NextConfig} */
const nextConfig = {
  // StrictMode double-invokes effects in dev; turned off so the one-time
  // storage seeding on first load behaves predictably.
  reactStrictMode: false,
};

export default nextConfig;
