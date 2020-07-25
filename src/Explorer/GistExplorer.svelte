<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();
  let category;
  let gists;
  let gist;

  $: if(gist){
    dispatch('bundleChange', gist);
  }

  const gistsFetch = async () => {
    await fetch('/gists.json')
      .then(data => data.json())
      .then(data => {
        gists = data;
        category = gists[0];
        gist = category[0];
      })
    };
  onMount(() => {
    gistsFetch();
  })
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
    font: 500 14px var(--font);
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

{#if gists}
  {#each gists as type (type.category)}
    <div>
      <h3 
        class:active={category === type}              
        class="category-title"
        >
        {type.category}
      </h3>
        <ul>
          {#each type.bundles as bundle (bundle.slug)}
            <li 
              class:active={gist === bundle} 
              on:click={() => {gist = bundle; category = type}}
            >
              {bundle.title}
              <span class="fa fa-code-branch"></span>
            </li>
          {/each}
        </ul>
    </div>
  {/each}
{/if}
