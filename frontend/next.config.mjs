/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // УВІМКНЕМО оптимізацію замість unoptimized: true
    unoptimized: false,
    
    // Дозволяємо завантажувати зображення з зовнішніх доменів
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'en.onepiece-cardgame.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.onepiece-cardgame.com',
        port: '',
        pathname: '/images/**',
      }
    ],
    
    // Оптимізація зображень
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 днів кешування
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Оптимізація продуктивності
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Компресія
  compress: true,
}

export default nextConfig
