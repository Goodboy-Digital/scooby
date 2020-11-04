import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/scripts/index.ts',
    output: [
        {
            file: 'dist/browser/TextureMonitor.js',
            format: 'iife',
            sourcemap: true,
        },
        {
            file: 'dist/esm/TextureMonitor.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
            check: false,
        }),
        postcss({ extensions: ['.scss'] }),
    ],
};

