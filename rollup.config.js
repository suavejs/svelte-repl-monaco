import resolve from 'rollup-plugin-node-resolve';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';

const dev = process.env.ROLLUP_WATCH;

// bundle workers
export default ['compiler', 'bundler', 'typings'].map(x => ({
	input: `src/workers/${x}/index.js`,
	output: {
		file: `workers/${x}.js`,
		format: 'iife'
	},
	plugins: [
		resolve(),
		builtins(),
		json(),
		!dev && terser()
	]
}));