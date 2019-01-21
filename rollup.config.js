import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy-assets';
import { uglify } from 'rollup-plugin-uglify';


export default {
    input: 'index.js',
    output: {
        file: 'dist/renew-formalism-pt.js',
        name: 'formalismPT',
        format: 'umd',
    },
    plugins: [
        resolve({ customResolveOptions: { moduleDirectory: 'node_modules' } }),
        babel({ exclude: 'node_modules/**' }),
        json(),
        commonjs(),
        copy({
            assets: [
                './assets'
            ],
        }),
    ],
    external: [],
};
