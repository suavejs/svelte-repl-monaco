<script context="module">
	import { is_browser } from './env.js';

	let monaco_promise;
	let _Monaco;
	
	if (is_browser) {
		monaco_promise = import('./monaco');
		monaco_promise.then(mod => {
			_Monaco = mod;
		});
	}
</script>

<script>
	import { onMount, onDestroy, beforeUpdate, createEventDispatcher, getContext } from 'svelte';
	import Message from './Message.svelte';
	const { navigate, selected, bundle, components} = getContext('REPL');
	
	const dispatch = createEventDispatcher();
	let error;
	export let readonly = false;
	export let errorLoc = null;
	export let flex = false;

	export let name = 'App.svelte';
	export let mode = 'handlebars';
	let code = "<script>\n\tlet name = 'world';\n<\/script>\n\n<h1>Hello {name}!</h1>";
	let editor;
	let model;
	async function handleInput() {
		code = await editor.getModel().getValue();
		dispatch('change',  code);
	}
	let w;
	let h;
	onMount(async () => {
		if(_Monaco) {
			Monaco = _Monaco
		}else {
			await monaco_promise.then(mod => {
				Monaco = mod;
			});
		}
		editor = await Monaco.createEditor(refs.editor, name, mode, code, readonly);
		model = editor.getModel();
		return editor;
	});
	
	
	export async function set(new_component) {
		if(Monaco){
			model =	await Monaco.handleSelect(new_component);
		}
		if(editor){
			editor.setModel(model);
		}
	}

	export async function update(existing_component) {
		if(Monaco){
			model =	await Monaco.handleUpdate(existing_component);
		}
		if(editor){
			editor.setModel(model);
		}
	}

	export async function rename(old_name, new_component){
		if(Monaco){
			model = await Monaco.handleRename(old_name, new_component.name)
		}
		if(editor){
			editor.setModel(model);
		}
	}
	export async function add(new_component) {
		if (Monaco){
			model = await Monaco.handleAdd(new_component);
		}
		if(editor){
			editor.setModel(model);
		}
	}

	export async function remove(existing_component) {
		if (existing_component.name.split('.').length < 2) {
			existing_component.name = `${ existing_component.name }.${ existing_component.type }`;
		}

		if(Monaco){
			Monaco.handleRemove(existing_component.name);
		}
	}

	export function resize() {
	 editor.focus();
	}

	export function focus() {
		if(editor) {
			editor.focus();
		}
	}

	const refs = {};

	let updating_externally = false;
	let marker;
	let error_line;
	let destroyed = false;
	let Monaco;
	$: if (editor && w && h) {
		editor.focus();
	}

	let first = true;
</script>

<div class:flex bind:offsetWidth={w} bind:offsetHeight={h}>
	<div 
		bind:this={refs.editor}
		on:keyup={() => handleInput()}
		on:change={() => handleInput()}
		style="height:100%;width:100%;"
		readonly-{readonly}
		value={code}>
	</div>
</div>