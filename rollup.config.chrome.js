import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { writeFileSync } from 'fs';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/scripts/index.ts',
    output: [
        {
            file: 'temp/TextureMonitor.js',
            format: 'iife',
        },
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
            check: false,
        }),
        copy({
            targets: [
                { src: 'src/chrome-extension/**/*', dest: 'dist/chrome' },
            ],
        }),
        scss({
            output(styles)
            {
                writeFileSync('dist/chrome/TextureMonitor.css', styles);
            },
        }),
    ],
};
