import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import del from 'rollup-plugin-delete';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import workerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

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
            sourcemap: true
        }
    ],
    plugins: [
        del({ targets: 'lib/*', runOnce: true }),
        nodeResolve({ extensions }),
        workerLoader({ targetPlatform: 'browser', inline: false, preserveFileName: true}),
        typescript(),
        peerDepsExternal(),
        babel({
            runtimeHelpers: true,
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false }], ['@babel/preset-react']],
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
