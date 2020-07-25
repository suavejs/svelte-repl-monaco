import { registerLanguage, loadLanguage } from 'monaco-editor/esm/vs/basic-languages/_.contribution';
registerLanguage({
    id: 'svelte',
    extensions: ['.svelte', '.sve'],
    aliases: ['Svelte', 'svelte'],
    mimetypes: ['text/x-svelte'],
    loader: function () { return import('./svelte.js') }
})
