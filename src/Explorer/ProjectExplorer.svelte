<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();
  
  let folders = new Set();
  let files;
  let selected;

  $: if(files){
    files.filter(file => file.length > 1)
      .map(file => folders.add(file[0]))
  }

  $: if(selected) dispatch('bundleChange', selected);

  let projectFetch = () => fetch('/svelte-app.json');
  onMount(async () => {
    files = await projectFetch()
      .then(data => data.json())
      .then(files => files.map(file => file.path.split('/')))
  });
</script>
<style> 

  ul{
    margin: 0;
    padding: .5rem;
    white-space: nowrap;
  }
  li{
    border: 1px solid transparent;
    border-radius: var(--radius);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: .5rem;
    border: 1px solid var(--secondary);
    list-style: none;
    cursor: pointer;
    font: 500 14px var(--font-mono);
  }
  li:hover {
    border-color: var(--primary);
  }
  li.active {
    background: var(--primary);
    color: var(--surface);
  }
  li > span {
    margin-left: 8px;
    padding: .25rem;
  }
  li > span:hover{
    color: var(--accent);
    border-color: var(--accent);
  }
  .category-title {
    font-size: 1rem;
    margin: 0 auto;
    padding: .25rem;
    border-bottom: 2px solid transparent;
  }
  .category-title.active {
    border-bottom: 2px solid var(--primary);
  }
</style>
{#if files}
  <ul>
    {#each [...folders] as folder}
      <li>{folder}
      <ul>
        {#each files as file}
        {#if file[0] === folder}
         <li>{file[1]}</li>
        {/if}
        {/each}
        </ul>
      </li>
    {/each}
    {#each files.filter(file => file.length === 1) as file (file.path)}
      <li
        class:active={file === selected}
        on:click={() => selected = file}      
        class="category-title"
        >
        {file[0]}
      </li>       
  {/each}
  </ul>
{/if}
