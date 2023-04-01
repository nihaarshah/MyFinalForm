// /** @type {import('next').NextConfig} /
const nextConfig = {
  reactStrictMode: true,
};
module.exports = () => {
  const rewrites = () => {
    return [
      {
        source: "api/:path",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  };
  return {
    rewrites,
  };
};
module.exports = nextConfig;
