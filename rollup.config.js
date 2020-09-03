import { terser } from "rollup-plugin-terser";

export default [
    {
        input: "src/collection-summary.js",
        output: [
            {file: 'dist/collection-summary.js', format: 'es'}
        ],
        plugins: [
            terser()
        ]
    },
    {
        input: "src/crs-collection-summary.js",
        output: [
            {file: 'dist/crs-collection-summary.js', format: 'es'}
        ],
        plugins: [
            terser()
        ]

    }
]
