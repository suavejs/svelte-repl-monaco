<script>
    import Tabs from '../../../Tabs.svelte';
    import DocExplorer from './DocExplorer.svelte';
    import GistExplorer from './GistExplorer.svelte';
    import ProjectExplorer from './ProjectExplorer.svelte';
    import {createEventDispatcher} from 'svelte';

    let dispatch = createEventDispatcher();
  
    const tabs = [
      { 
        name: 'docs', 
        content: `<input type=search placeholder="search docs"/>`, 
        component: DocExplorer 
      },
      { 
        name: 'repl', 
        content: `Gists`,  
        component: GistExplorer 
      },
      { 
        name: 'projects', 
        content: `Projects`, 
        component: ProjectExplorer 
      },
    ];
    export let tab = 'docs';
    export let bundle;
    export let view;
    $: view = tabs.find(t => t.name === tab);
    $: {dispatch('viewChange', view)}
</script>

<style>
  header {
    padding-bottom: 1rem;
  }
  div.panel-content {
    height: 80vh;
    overflow-y: auto;
  }
</style>

<header class="panel-header">
  <Tabs bind:view {tabs}/>
</header>

<div class="panel-content">
    <svelte:component on:bundleChange this={view.component}/>
</div>
    