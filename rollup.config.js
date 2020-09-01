import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.js",
    output: [
        {file: 'dist/crs-collection-summary.min.js', format: 'cjs'},
        {file: 'dist/crs-collection-summary.esm.js', format: 'es'}
    ],
    plugins: [
        terser()
    ]
};