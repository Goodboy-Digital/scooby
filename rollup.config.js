import { writeFileSync } from 'fs';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/scripts/TextureMonitor.ts',
    output: {
        file: 'temp/TextureMonitor.js',
        format: 'iife',
    },
    plugins: [
        typescript({
            check: false,
        }),
        scss({
            output(styles)
            {
                writeFileSync('dist/TextureMonitor.css', styles);
            },
        }), // will output compiled styles to output.css
        copy({
            targets: [
                { src: 'src/chrome-extension/**/*', dest: 'dist/' },
            ],
        }),
    ],
};
