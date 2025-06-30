const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      // 'loose' 옵션을 true로 설정하여 CRA 기본 설정과의 충돌을 해결합니다.
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],

      // 기존에 있던 다른 플러그인들은 그대로 둡니다.
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-transform-shorthand-properties',
    ],
  },

  webpack: {
    alias: {
      // lib-es → lib(CJS) 매핑
      '@ledgerhq/hw-transport/lib-es': '@ledgerhq/hw-transport/lib',
      '@ledgerhq/errors/lib-es': '@ledgerhq/errors/lib',
    },
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
