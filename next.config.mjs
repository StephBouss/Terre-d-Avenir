import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ['image/avif', 'image/webp'] },
  experimental: { globalNotFound: true },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
