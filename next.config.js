/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' http://localhost:* https://*.vercel.app https://*.ngrok-free.app https://secure-mobile.walletconnect.com https://secure.walletconnect.com;`,
          },
        ],
      },
    ]
  },
}
