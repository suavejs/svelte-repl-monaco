import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true
});
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  allowJs: true,
  esModuleInterop: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  allowSyntheticDefaultImports: true,
  rootDir: './src',
  outDir: './build',
  declaration: true,
  declarationDir: './types',
  resolveJsonModule: true
});

const editorStates = new Map();

export async function handleAdd(component: Component) {
  let mode = component.type || 'typescript';
  if (component.type === 'svelte') {
    mode = 'handlebars'
  }
  if (component.type === 'javascript' || component.type === 'js' || component.type === 'ts') {
    component.type = 'ts';
    mode = 'typescript'
  }
  if (!component.source) {
    component.source = '';
  }
  let model = monaco.editor.getModel(monaco.Uri.file(`${component.name}.${component.type}`));
  if (model) {
    model.setValue(component.source);
  } else {
    model = monaco.editor.createModel(
      component.source,
      mode,
      monaco.Uri.file(`${component.name}.${component.type}`)
    );
  }
  return model;
}

export async function handleSelect(component: Component) {
  let model = monaco.editor.getModel(monaco.Uri.file(`${component.name}.${component.type}`));
  if (!model) {
    model = await handleAdd(component);
  } else {
    component.source && model.setValue(component.source);
  }
  let mode = component.type || 'typescript';
  if (model.getModeId() !== mode) {
    await updateMode(model, component.type);
  }
  
  return model;
}

export async function handleRemove(component: Component) {
  editorStates.delete(component.name);

  let model = monaco.editor.getModel(monaco.Uri.file(`${component.name}.${component.type}`));

  model && model.dispose();
}

export async function handleUpdate(component: Component) {
  let model = monaco.editor.getModel(monaco.Uri.file(`${component.name}.${component.type}`));
  if (!model) {
    model = await handleAdd(component)
  }
  if (component.source && component.source !== model.getValue()) {
    model.setValue(component.source);
  }  
  if (model.getModeId() !== component.type) {
    updateMode(model, component.type);
  }
  return model;
}

export async function handleRename(oldComponent: Component, newComponent: Component) {
  handleRemove(oldComponent);
  return await handleAdd(newComponent)
}

// export async function updateMarkers({ markers, version }) {
//   requestAnimationFrame(() => {
//     const model = monaco.editor.getModel();

//     if (model && model.getVersionId() === version) {
//       monaco.editor.setModelMarkers(model, 'eslint', markers);
//     }
//   });
// }

export async function updateMode(model: monaco.editor.ITextModel, mode: string = 'html') {
  let lang = mode;
  if (mode === 'javascript' || mode === 'js' || mode === 'ts') {
    lang = 'typescript';
  }
  if (mode === 'svelte') {
    lang = 'handlebars'
  }
  await monaco.editor.setModelLanguage(model, lang);
  return await monaco.editor.getModel(model.uri) || model;
}

interface Theme {
  id: string;
  name: string;
  data: monaco.editor.IStandaloneThemeData;
}

export async function updateTheme(theme: Theme) {
    if(theme.name == 'vs' || theme.name == 'vs-dark') {
      return await monaco.editor.setTheme(theme.name);
    } else {
     const res = await fetch(`/themes/${encodeURIComponent(theme.name)}.json`)
      const themes: Theme[] = await res.json();
      return themes.forEach(theme => {
        monaco.editor.defineTheme(theme.id, theme.data);
        monaco.editor.setTheme(theme.name);
      })
    }
}

export async function createEditor(editorRef: HTMLElement, name: string, mode: string, code: string, readonly = false, options: monaco.editor.IEditorConstructionOptions = {}) {
  let editor = await monaco.editor.create(editorRef, options = {
    model: null,
    theme: 'Oceanic Next',
    fontSize: 15,
    fontWeight: '600',
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
    automaticLayout: true,
    scrollBeyondLastLine: false,
    foldingStrategy: 'indentation',
    fontLigatures: true,
    readOnly: readonly,
    minimap: {
      enabled: false
    }
  });

  monaco.editor.setTheme('oceanic-next');
  let type = mode;
  if (mode === 'svelte') {
    type = 'handlebars'
  }
  if (mode === 'javascript' || mode === 'js' || mode === 'ts') {
    mode = 'ts';
    type = 'typescript';
  }
  let model = await monaco.editor.createModel(code, type, monaco.Uri.file(`${name}.${mode}`));
  await editor.setModel(model);
  return editor;
}
export let extraLibs = new Map();
export async function addTypings( typings: { [x: string]: string; } ) {
    await Object.keys(typings).forEach(path => {
      let extraLib = extraLibs.get(path);

      extraLib && extraLib.dispose();
      extraLib = monaco.languages.typescript.typescriptDefaults.addExtraLib(
        typings[path],
        `node_modules/@types/${path}`
      );

      extraLibs.set(path, extraLib);
    });
  }
monaco.languages.typescript.typescriptDefaults.addExtraLib(`
declare module "*.svelte" {
  declare interface ComponentOptions {
    target: HTMLElement;
    anchor?: HTMLElement | null;
    props?: {};
    hydrate?: boolean;
    intro?: boolean;
  }
  declare class SvelteComponent {
    new (options: ComponentOptions): any;
    // client-side methods
    $set(props: {}): void;
    $on(event: string, callback: (event: CustomEvent) => void): void;
    $destroy(): void;
    // server-side methods
    render(props?: {}): {
      html: string;
      css: { code: string; map: string | null };
      head?: string;
    };
  }
  const component = new SvelteComponent({...options});
  export default component;
}
`,
'node_modules/@types/svelte/index.d.ts'
);
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `/** Callback to inform of a value updates. */
  declare type Subscriber<T> = (value: T) => void;
  /** Unsubscribes from value updates. */
  declare type Unsubscriber = () => void;
  /** Callback to update a value. */
  declare type Updater<T> = (value: T) => T;
  /** Cleanup logic callback. */
  declare type Invalidator<T> = (value?: T) => void;
  /** Start and stop notification callbacks. */
  declare type StartStopNotifier<T> = (set: Subscriber<T>) => Unsubscriber | void;
  /** Readable interface for subscribing. */
  export interface Readable<T> {
    /**
     * Subscribe on value changes.
     * @param run subscription callback
     * @param invalidate cleanup callback
     */
    subscribe(run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
  }
  /** Writable interface for both updating and subscribing. */
  export interface Writable<T> extends Readable<T> {
    /**
     * Set value and inform subscribers.
     * @param value to set
     */
    set(value: T): void;
    /**
     * Update value using callback and inform subscribers.
     * @param updater callback
     */
    update(updater: Updater<T>): void;
  }
  /**
   * Creates a 'Readable' store that allows reading by subscription.
   * @param value initial value
   * @param {StartStopNotifier}start start and stop notifications for subscriptions
   */
  export declare function readable<T>(value: T, start: StartStopNotifier<T>): Readable<T>;
  /**
   * Create a 'Writable' store that allows both updating and reading by subscription.
   * @param {*=}value initial value
   * @param {StartStopNotifier=}start start and stop notifications for subscriptions
   */
  export declare function writable<T>(value: T, start?: StartStopNotifier<T>): Writable<T>;
  /** One or more 'Readable's. */
  declare type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];
  /** One or more values from 'Readable' stores. */
  declare type StoresValues<T> = T extends Readable<infer U> ? U : {
    [K in keyof T]: T[K] extends Readable<infer U> ? U : never;
  };
  /**
   * Derived value store by synchronizing one or more readable stores and
   * applying an aggregation function over its input values.
   * @param {Stores} stores input stores
   * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
   * @param {*=}initial_value when used asynchronously
   */
  export declare function derived<T, S extends Stores>(stores: S, fn: (values: StoresValues<S>, set?: Subscriber<T>) => T | Unsubscriber | void, initial_value?: T): Readable<T>;
  /**
   * Get the current value from a store by subscribing and immediately unsubscribing.
   * @param store readable
   */
  export declare function get<T>(store: Readable<T>): T;
  export {};`,
  'node_modules/@types/svelte/store/index.d.ts'
)
monaco.languages.typescript.typescriptDefaults.addExtraLib(`
interface T$$ {
  dirty: null;
  ctx: null | any;
  bound: any;
  update: () => void;
  callbacks: any;
  after_update: any[];
  props: any;
  fragment: null | any;
  not_equal: any;
  before_update: any[];
  context: Map<any, any>;
  on_mount: any[];
  on_destroy: any[];
}
export declare function bind(component: any, name: any, callback: any): void;
export declare function mount_component(component: any, target: any, anchor: any): void;
export declare function destroy_component(component: any, detaching: any): void;
export declare function init(component: any, options: any, instance: any, create_fragment: any, not_equal: any, prop_names: any): void;
export declare let SvelteElement: any;
export declare class SvelteComponent {
  $$: T$$;
  $destroy(): void;
  $on(type: any, callback: any): () => void;
  $set(): void;
}
export declare class SvelteComponentDev extends SvelteComponent {
  constructor(options: any);
  $destroy(): void;
}
export {};`,
  'node_modules/@types/svelte/internal/Component.d.ts'
)
export default monaco;