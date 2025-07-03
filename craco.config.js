const CracoLessPlugin = require('craco-less');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// Babel 변환(transpile)이 필요한 패키지 목록
const packagesToTranspile = [
  '@solana',
  '@project-serum',
  // @ledgerhq는 alias로 처리하므로 여기서는 제외해도 될 수 있으나,
  // 만약을 위해 남겨두는 것이 안전합니다.
  '@ledgerhq',
];

module.exports = {
  webpack: {
    // 1. 모듈 경로 오류 해결을 위한 alias 설정
    alias: {
      '@ledgerhq/devices/hid-framing': '@ledgerhq/devices/lib/hid-framing',
      // 다른 @ledgerhq 패키지들도 lib를 사용하도록 강제
      '@ledgerhq/hw-transport-webhid/lib-es':
        '@ledgerhq/hw-transport-webhid/lib',
      '@ledgerhq/hw-transport/lib-es': '@ledgerhq/hw-transport/lib',
      '@ledgerhq/errors/lib-es': '@ledgerhq/errors/lib',
      '@ledgerhq/devices/lib-es': '@ledgerhq/devices/lib',
    },
    configure: (config) => {
      // ── 1. Node core 모듈 브라우저 대응 ───────────────────────────
      config.resolve.fallback = {
        fs: false, // 브라우저에서 쓸 일 없음
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };

      // ── 2. 전역 객체(process·Buffer) 주입 ────────────────────────
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        // ── 3. 나머지 polyfill 자동 주입 ──────────────────────────
        new NodePolyfillPlugin(),
      );

      config.module.rules = config.module.rules.map((rule) => {
        if (
          rule.use &&
          rule.use.find((u) => u.loader?.includes('source-map-loader'))
        ) {
          rule.exclude = [
            /node_modules\/@openbook-dex/,
            /node_modules\/@project-serum/,
            /node_modules\/@solana/,
          ];
        }
        return rule;
      });

      return config;
    },
  },
  babel: {
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#2abdd2' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
