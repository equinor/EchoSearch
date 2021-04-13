import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import dt from 'rollup-plugin-dts';
import html2 from 'rollup-plugin-html2';
import livereload from 'rollup-plugin-livereload';
import server from 'rollup-plugin-server';
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
        workerLoader({
            preserveFileNames: true,
            inline: false
        }),
        typescript(),
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
        commonJs(),

        replace({
            preventAssignment: false,
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        html2({
            template: 'public/index.html'
        })
    ]
};

/**
 * Rollup types configuration for Echo Projects
 * Providing type decelerations.
 */
const types = {
    input: pkg.source,
    output: [
        {
            file: pkg.types,
            format: 'es'
        }
    ],
    plugins: [
        dt(),
        copy({
            targets: [
                { src: 'public/ee.png', dest: 'lib' },
                { src: 'public/style.css', dest: 'lib' }
            ]
        }),

        /**https://www.npmjs.com/package/rollup-plugin-serve */
        server({
            contentBase: ['lib', 'public'],
            port: 3000,
            verbose: true,
            open: true,
            ssl: true,
            host: 'localhost'
        }),
        livereload({ watch: 'lib' })
    ]
};

export default [config, types];
