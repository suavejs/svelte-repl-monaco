<script>
	import { getContext, onMount } from 'svelte';
	import Monaco from '../Monaco.svelte';
	import Message from '../Message.svelte';

	const { bundle, selected, components, handle_change, navigate, register_module_editor } = getContext('REPL');
	export let errorLoc;
	let editor;
	onMount(() => {
		register_module_editor(editor);
	});
	export function focus() {
		editor.focus();
	}
	
	let name = 'App.svelte';
	let mode = 'handlebars';

	let files = [
	  {name: 'App.svelte', source: ''}
	];

</script>

<style>
	.editor-wrapper {
		z-index: 5;
		background: var(--secondary);
		display: flex;
		flex-direction: column;
	}
	.editor {
		height: 0;
		flex: 1 1 auto;
	}
	:global(.columns) .editor-wrapper {
		padding-right: 8px;
		height: auto;
	}
</style>

<div class="editor-wrapper">
	<div class="editor">
		<Monaco
			bind:this={editor}
			{errorLoc}
			on:change={handle_change}
			{name}
			{mode}
		/>
	</div>

	<div class="info">
		{#if $bundle}
			{#if $bundle.error}
				<Message kind="error" details={$bundle.error} filename="{$selected.name}.{$selected.type}"/>
			{:else if $bundle.warnings.length > 0}
				{#each $bundle.warnings as warning}
					<Message kind="warning" details={warning} filename="{$selected.name}.{$selected.type}"/>
				{/each}
			{/if}
		{/if}
	</div>
</div>