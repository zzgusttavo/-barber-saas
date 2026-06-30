import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['barber-saas-dev.loca.lt', 'easy-areas-wonder.loca.lt', 'loca.lt', 'localhost:3000'],
  serverExternalPackages: ['@prisma/client', 'prisma']
};

export default nextConfig;
