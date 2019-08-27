<script context="module">
  import { is_browser } from "./env.js";

  let monaco_promise;
  let _Monaco;

  if (is_browser) {
    monaco_promise = import(
      /* webpackChunkName: "monaco" */ "./monaco.js"
    );

    monaco_promise.then(mod => {
      _Monaco = mod.default;
    });
  }
</script>

<script>
  import {
    onMount,
    beforeUpdate,
    createEventDispatcher,
    getContext,
  } from "svelte";
  import Message from "./Message.svelte";

  const dispatch = createEventDispatcher();
  const { selected, navigate } = getContext("REPL");

  export let readonly = false;
  export let errorLoc = null;
  export let flex = false;
  export let lineNumbers = true;
  export let tab = true;

  let w;
  let h;
  let code = "select a component";
  let mode = 'handlebars';
  let model;

  export async function set(new_code, new_mode) {
    if (editor && new_mode !== mode) {
      mode = new_mode;
      await Monaco.editor.setModelLanguage(model, modes[new_mode] || mode);
    }

    code = new_code;
    updating_externally = true;
    if (editor) editor.setValue(code);
    updating_externally = false;
  }

  export function update(new_code) {
    code = new_code;

    if (editor) {
      editor.setValue(new_code);
    }
  }

  export function resize() {
    editor.layout();
  }

  export function focus() {
    editor.focus();
  }

  const modes = {
    js: 'typescript',
    json:  "json",
    svelte: "handlebars",
    svexy: "markdown"
  };

  const refs = {};
  let editor;
  let updating_externally = false;
  let marker;
  let error_line;
  let destroyed = false;
  let Monaco;

  $: if (editor && w && h) {
    editor.layout();
  }

  $: {
    if (marker) marker.clear();

    if (errorLoc) {
      const line = errorLoc.line - 1;
      const ch = errorLoc.column;

      marker = editor.markText(
        { line, ch },
        { line, ch: ch + 1 },
        {
          className: "error-loc"
        }
      );

      error_line = line;
    } else {
      error_line = null;
    }
  }

  let previous_error_line;
  $: if (editor) {
    if (previous_error_line != null) {
      editor.removeLineClass(previous_error_line, "wrap", "error-line");
    }

    if (error_line && error_line !== previous_error_line) {
      editor.addLineClass(error_line, "wrap", "error-line");
      previous_error_line = error_line;
    }
  }

  onMount(() => {
    if (_Monaco) {
      Monaco = _Monaco;
      createEditor(mode, code);
    } else {
      monaco_promise.then(async mod => {
        Monaco = mod.default;
        await createEditor(mode, code);
      });
    }
    return () => {
      destroyed = true;
      if (editor) editor.dispose();
    };
  });

  let first = true;

  async function createEditor(mode, value) {
    if (destroyed || !Monaco) return;

    if (editor) editor.dispose();
    if(mode === 'js' || mode === 'javascript'){
      mode = 'typescript'
    }
    if(mode === 'svelte' || mode === 'html'){
      mode = 'handlebars'
    }
    const opts = {
      language: mode,
      value: value,
      theme: 'oceanic-next',
      fontSize: 16,
      fontWeight: '500',
      formatOnType: true,
      formatOnPaste: true,
      highlightActiveIndentGuide: true,
      renderLineHighlight: "gutter",
      lineNumbersMinChars: 2,
      showFoldingControls: "always",
      tabCompletion: "on",
      autoClosingBrackets: 'languageDefined',
      autoClosingQuotes: 'languageDefined',
      autoIndent: true,
      autoSurround: 'languageDefined',
      automaticLayout: false,
      scrollBeyondLastLine: false,
      foldingStrategy: 'indentation',
      fontLigatures: true,
      readOnly: false,
      minimap: {
          enabled: false
      }
    }

    if (destroyed) return;

    editor = await Monaco.editor.create(refs.editor, opts);
    model = await editor.getModel();
    model.onDidChangeModelContent = () => {
      if (!updating_externally) {
        const value = editor.getValue();
        dispatch("change", { value });
      }
    };
    editor.layout();
    first = false;
  }

  function sleep(ms) {
    return new Promise(fulfil => setTimeout(fulfil, ms));
  }
</script>

<style>
  .monaco-container {
    position: relative;
    width: 100%;
    height: 100%;
    border: none;
    line-height: 1.5;
    overflow: hidden;
  }

  .monaco-container :global(.Monaco) {
    height: 100%;
    background: transparent;
    font: 14px/1.7 var(--font-mono);
  }

  .monaco-container.flex :global(.Monaco) {
    height: auto;
  }

  .monaco-container.flex :global(.Monaco-lines) {
    padding: 0;
  }

  .monaco-container :global(.Monaco-gutters) {
    padding: 0 16px 0 8px;
    border: none;
  }

  .monaco-container :global(.error-loc) {
    position: relative;
    border-bottom: 2px solid #da106e;
  }

  textarea {
    visibility: hidden;
  }
</style>

<div
  class="monaco-container"
  class:flex
  bind:offsetWidth={w}
  bind:offsetHeight={h}>
  <div style="width: 100%; height: 100%;" tabindex="2" bind:this={refs.editor} readonly value={code} />

  {#if !Monaco}
    <div style="position: absolute; width: 100%; bottom: 0">
      <Message kind="info">loading editor...</Message>
    </div>
  {/if}
</div>
