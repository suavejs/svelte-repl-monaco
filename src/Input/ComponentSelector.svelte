<script>
	import { getContext, createEventDispatcher } from 'svelte';

	export let handle_select;
	export let handle_add;
	export let handle_remove;
	export let handle_update;

	const { components, selected, request_focus, rebundle } = getContext('REPL');

	let editing = null;
	let uid = 1;

	function selectComponent(component) {
		if ($selected !== component) {
			editing = null;
			handle_select(component);
		}
	}

	function editTab(component) {
		if ($selected === component) {
			editing = $selected;
		}
	}

	function closeEdit() {
		const match = /(.+)\.(svelte|js|ts|json)$/.exec($selected.name);
		$selected.name = match ? match[1] : $selected.name;
		if (match && match[2]) $selected.type = match[2];
		editing = null;

		// re-select, in case the type changed
		handle_select($selected);

		components = components; // TODO necessary?
		// focus the editor, but wait a beat (so key events aren't misdirected)
		setTimeout(request_focus);

		rebundle();
	}

	function remove(component) {
		let result = confirm(`Are you sure you want to delete ${component.name}.${component.type}?`);
		if (result) {
			handle_remove(component);
			const index = $components.indexOf(component);
			if (~index) {
				components.set($components.slice(0, index).concat($components.slice(index + 1)));
				handle_remove(component);
			} else {
				console.error(`Could not find component! That's... odd`);
			}
			handle_select($components[index] || $components[$components.length - 1]);
		}
	}

	function selectInput(event) {
		setTimeout(() => {
			event.target.select();
		});
	}

	function addNew() {
		const component = {
			name: uid++ ? `Component${uid}` : 'Component1',
			type: 'svelte',
			source: ''
		};

		editing = component;

		setTimeout(() => {
			// TODO we can do this without IDs
			document.getElementById(component.name).scrollIntoView(false);
		});

		components.update(components => components.concat(component));
		handle_add(component);
	}
</script>

<style>
	.component-selector {
		position: relative;
		height: var(--pane-controls-h);
		white-space: nowrap;
		box-sizing: border-box;		
	}

	.file-tabs {
		border: none;
		margin: 0;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.file-tabs .button, .file-tabs button {
		text-align: left;
		position: relative;
		font: 600 14px/1.5 var(--font-mono);
		border: none;
		border-bottom: 2px solid var(--secondary);
		display: inline-block;
		padding: 12px 20px 8px 12px;
		color: var(--light);
		border-radius: 0;
		margin: 0;
		cursor: pointer;
	}

	.file-tabs .button:first-child {
		padding-left: 12px;
	}

	.file-tabs .button.active {
		color: var(--primary);
		border-bottom: 2px solid var(--primary);
	}

	.editable, .uneditable, .input-sizer, input {
		display: inline-block;
		position: relative;
	}
	.input-sizer {
		color: #ccc;
	}

	input {
		position: absolute;
		width: 100%;
		left: 8px;
		top: 12px;
		font: 500 12px/1.5 var(--font-mono);
		border: none;
		color: var(--dark);
		outline: none;
		background-color: transparent;
	}

	.remove {
		position: absolute;
		display: none;
		right: 1px;
		top: 4px;
		width: 16px;
		text-align: right;
		padding: 12px 0 12px 5px;
		font-size: 8px;
		color: var(--light);
	}

	.remove:hover {
		cursor: pointer;
		color: var(--danger);
	}

	.file-tabs .button.active .editable {
		cursor: text;
	}

	.file-tabs .button.active .remove {
		display: block;
	}

	.add-new {
		position: absolute;
		left: 0;
		top: 0;
		padding: 12px 12px 8px 12px !important;
		height: 100%;
		text-align: center;
		background: transparent;
	}

	.add-new:hover {
		cursor: pointer;
		color: var(--primary) !important;
	}

	svg {
		position: relative;
		overflow: hidden;
		vertical-align: middle;
		-o-object-fit: contain;
		object-fit: contain;
		-webkit-transform-origin: center center;
		transform-origin: center center;

		stroke: currentColor;
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
</style>

<div class="component-selector">
	{#if $components.length}
		<div class="file-tabs" on:dblclick="{addNew}">
			{#each $components as component}
				<div
					id={component.name}
					class="button"
					role="button"
					class:active="{component === $selected}"
					on:click="{() => selectComponent(component)}"
					on:dblclick="{e => e.stopPropagation()}"
				>
					{#if component.name == 'App'}
						<div class="uneditable">
							App.svelte
						</div>
					{:else}
						{#if component === editing}
							<span class="input-sizer">{editing.name + (/\./.test(editing.name) ? '' : `.${editing.type}`)}</span>
							<input
								autofocus
								spellcheck={false}
								bind:value={editing.name}
								on:focus={selectInput}
								on:blur={closeEdit}
								on:keydown={e => e.which === 13 && e.target.blur()}
							>
						{:else}
							<div
								class="editable"
								title="edit component name"
								on:click="{() => editTab(component)}"
							>
								{component.name}.{component.type}
							</div>

							<span class="remove" on:click="{() => remove(component)}">
								<svg width="12" height="12" viewBox="0 0 24 24">
									<line  x1='18' y1='6' x2='6' y2='18' />
									<line x1='6' y1='6' x2='18' y2='18' />
								</svg>
							</span>
						{/if}
					{/if}
				</div>
			{/each}

			<button class="add-new" on:click={addNew} title="add new component">
				<svg width="12" height="12" viewBox="0 0 24 24">
					<line x1='12' y1='5' x2='12' y2='19' />
					<line  x1='5' y1='12' x2='19' y2='12' />
				</svg>
			</button>
		</div>
	{/if}
</div>
