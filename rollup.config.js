import commonJs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import dt from 'rollup-plugin-dts';
import html2 from 'rollup-plugin-html2';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import livereload from 'rollup-plugin-livereload';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import server from 'rollup-plugin-server';
import typescript from 'rollup-plugin-typescript2';
import workerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];

const environment = process.env.NODE_ENV;
const isDevelopment = environment === 'development';
const isProduction = !isDevelopment;

function print() {
    console.log('isDevelopment', isDevelopment, 'process.env.NODE_ENV', process.env.NODE_ENV, pkg.version);
}

function updatePackageVersionFromPackageJson() {
    let data = '/* eslint-disable */\n';
    data +=
        '// auto-generated from rollup.config.js, will be overwritten next production build. Version taken from package.json\n';
    data += `export const packageVersion = '${pkg.version}';`;
    fs.writeFileSync('./src/packageVersion.ts', data);
    console.log(data);
}
updatePackageVersionFromPackageJson();

setTimeout(() => print(), 1000);

/**
 * Rollup config configuration for Echo Projects
 * Compiling Typescript and support for Workers
 */
const config = {
    input: isDevelopment ? 'src/main.ts' : pkg.source,
    output: [
        {
            file: isDevelopment ? 'lib/main.js' : pkg.main,
            format: 'cjs',
            exports: 'named',
            sourcemap: true,
            globals: pkg.peerDependencies
        }
    ],
    plugins: [
        del({ targets: 'lib/*', runOnce: true }),
        nodeResolve({ extensions }),
        workerLoader({ preserveFileNames: false, inline: true, targetPlatform: 'browser' }),
        typescript(),
        // this will strip away libs in peerDeps in release, we should get the same instance as echopedia use instead.
        // note that peer dependencies doesn't work in worker/comlink
        isProduction && peerDepsExternal(),
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

        isDevelopment &&
            injectProcessEnv({
                NODE_ENV: environment,
                SOME_OBJECT: { one: 1, two: [1, 2], three: '3' },
                UNUSED: null
            }),
        isDevelopment &&
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
    plugins: isDevelopment
        ? [
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
        : [dt()]
};

export default [config, types];
