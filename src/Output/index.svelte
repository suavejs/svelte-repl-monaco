<script>
	import { getContext, onMount } from 'svelte';
	import SplitPane from '../SplitPane.svelte';
	import Viewer from './Viewer.svelte';
	import CompilerOptions from './CompilerOptions.svelte';
	import Compiler from './Compiler.js';
	import Monaco from '../Monaco.svelte';
	import Tabs from '../../../Tabs.svelte';
	import { is_browser } from '../env.js';

	const { register_output } = getContext('REPL');

	export let svelteUrl;
	export let workersUrl = 'workers';
	export let status;
	export let sourceErrorLoc = null;
	export let runtimeError = null;
	export let embedded = false;
	export let relaxed = false;
	export let injectedJS;
	export let injectedCSS;

	let foo; // TODO workaround for https://github.com/sveltejs/svelte/issues/2122


	register_output({
		set: async (selected, options) => {
			if (selected.type === 'js' || selected.type === 'ts') {
				compiled = {
					js: '/* Select a svelte component to see compiled output */',
					css: '/* Select a svelte component to see compiled output */',
				 	ast: '/* Select a svelte component to see compiled output */',
					stats: '/* Select a svelte component to see compiled output */',
					vars: '/* Select a svelte component to see compiled output */'
				};
				return;
			}
			compiled = await compiler.compile(selected, options);
		},

		update: async (selected, options) => {
			if (selected.type === 'js' || selected.type === 'ts') {
				compiled = {
					js: '/* Select a svelte component to see compiled output */',
					css: '/* Select a svelte component to see compiled output */',
				 	ast: '/* Select a svelte component to see compiled output */',
					stats: '/* Select a svelte component to see compiled output */',
					vars: '/* Select a svelte component to see compiled output */'
				};				return;
			}
			compiled = await compiler.compile(selected, options);
		}
	});

	let output_editor;
	const compiler = is_browser && new Compiler(workersUrl, svelteUrl);
	let compiled;
	let view = 'result';
	let content;
	$: if(compiled) {
		if(view === 'js'){
			content = {source: compiled.js, type: 'ts', name: "Compiled.js"};
		}else if(view === 'css'){
			content = {source: compiled.css, type: 'css', name: "Compiled.css"};
		}else	if(view === 'ast'){
			content = {source: JSON.stringify(compiled.ast, null, 2), type: 'json', name: "Ast.json"};
		}else	if(view === 'vars'){
			content = {source: JSON.stringify(compiled.vars, null, 2), type: 'json', name: 'Vars.json'};
		}else	if(view === 'stats'){
			content = {source: JSON.stringify(compiled.stats, null, 2), type: 'json', name: 'Stats.json'};
		}
	}

	$: if(view !== 'result'){
		output_editor.update(content)
	}
	
	const setters = {};

	let viewer;
	</script>

<style>
	.view-toggle {
		height: var(--pane-controls-h);
		border: none;
		white-space: nowrap;
		box-sizing: border-box;
	}

	button {
		background: transparent;
		text-align: left;
		position: relative;
		font: 600 14px/1.5 var(--font-mono);
		border: none;
		border-bottom: 2px solid var(--secondary);
		padding: 12px 12px 8px 12px;
		color: var(--light);
		border-radius: 0;
	}
	button:active, button:focus {
		outline: none;
	}

	button.active {
		border-bottom: 2px solid var(--primary);
		color: var(--primary);
	}

	div[slot] {
		height: 100%;
	}

	section[slot] {
		overflow: auto;
		color: var(--light);
		border-top: 3px solid var(--secondary);
	}

	h3 {
		font: 600 14px/1.2 var(--font);
		padding: 4px 0 12px 10px;
		color: var(--light);
	}

	.tab-content {
		padding-top: .5rem;
		position: absolute;
		width: 100%;
		height: calc(100% - 42px);
		opacity: 0;
		pointer-events: none;
	}

	.tab-content.visible {
		/* can't use visibility due to a weird painting bug in Chrome */
		opacity: 1;
		pointer-events: all;
	}
</style>

<div class="view-toggle">
	<button
		class:active="{view === 'result'}"
		on:click="{() => view = 'result'}"
	>Result</button>

	<button
		class:active="{view === 'js'}"
		on:click="{() => view = 'js'}"
	>JS output</button>

	<button
		class:active="{view === 'css'}"
		on:click="{() => view = 'css'}"
	>CSS output</button>

	<button
		class:active="{view === 'ast'}"
		on:click="{() => view = 'ast'}"
	>AST</button>

	<button
		class:active="{view === 'vars'}"
		on:click="{() => view = 'vars'}"
	>Vars</button>

	<button
	class:active="{view === 'stats'}"
	on:click="{() => view = 'stats'}"
	>Stats</button>

</div>

<div class="tab-content" class:visible="{view === 'result'}">
	<Viewer
		bind:this={viewer}
		bind:error={runtimeError}
		{status}
		{relaxed}
		{injectedJS}
		{injectedCSS}
	/>
</div>

<div class="tab-content" class:visible="{view !== 'result'}">
	<SplitPane type="vertical" pos={90}>
		<div slot="a">
			<Monaco
				bind:this={output_editor}
				name='Compiled.ts'
				directory="compiled"
				mode='ts'
				errorLoc={sourceErrorLoc}
				readonly=true
			/>
		</div>

		<div slot="b">
			<h3>Compiler options</h3>
			<CompilerOptions bind:foo={foo}/>
		</div>
	</SplitPane>
</div>
<!--
<div class="tab-content" class:visible="{view === 'ast'}">
	<Monaco
		bind:this={ast_editor}
		name="Ast.json"
		mode="json"
		errorLoc={sourceErrorLoc}
		readonly=true
	/>
</div>

<div class="tab-content" class:visible="{view === 'vars'}">
	<Monaco
		bind:this={vars_editor}
		name="Vars.json"
		mode="json"
		errorLoc={sourceErrorLoc}
		readonly=true
	/>
</div>

<div class="tab-content" class:visible="{view === 'stats'}">
	<Monaco
		bind:this={stats_editor}
		name="Stats.json"
		mode="json"
		errorLoc={sourceErrorLoc}
		readonly=true
	/>
</div> -->





