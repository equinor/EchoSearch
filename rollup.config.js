import getBabelOutputPlugin from '@rollup/plugin-babel';
import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import workerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const environment = process.env.NODE_ENV;
const isDevelopment = environment === 'development';

function print() {
    console.log('isDevelopment', isDevelopment, 'process.env.NODE_ENV', process.env.NODE_ENV);
}

setTimeout(() => print(), 1000);

/**
 * Rollup config configuration for Echo Projects
 * Compiling Typescript and support for Workers
 */
const config = {
    input: pkg.source,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            globals: pkg.peerDependencies
        }
    ],
    plugins: [
        del({ targets: 'lib/*', runOnce: true }),
        nodeResolve({ extensions }),
        workerLoader({ targetPlatform: 'browser' }),
        typescript(),
        peerDepsExternal(),
        getBabelOutputPlugin({
            /**
             * 'runtime' - you should use this especially when building libraries with Rollup.
             * It has to be used in combination with @babel/plugin-transform-runtime
             * https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
             *
             */
            babelHelpers: 'runtime',
            babelrc: false,
            presets: [['@babel/preset-env'], ['@babel/preset-react']],
            plugins: [
                [
                    '@babel/plugin-transform-runtime',
                    {
                        regenerator: true
                    }
                ]
            ],
            extensions,
            exclude: 'node_modules/**'
        }),
        commonJs()
    ]
};

export default config;
