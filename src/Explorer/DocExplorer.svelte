<script>
  import {onMount, createEventDispatcher} from 'svelte'
  const dispatch = createEventDispatcher();
  let category;
  let examples;
  let example;
  ;

  $: if(example){
    dispatch('bundleChange', example);
  }

  const examplesFetch = async () => {
    await fetch('/examples.json')
      .then(data => data.json())
      .then(data => {
        examples = data;
        category = examples[0];
        example = category.examples[0];
      })
    };
  onMount(() => {
    examplesFetch();
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

{#if examples}
  {#each examples as cat (cat.title)}
    <div>
      <h3 
        class:active={category === cat}              
        class="category-title"
        >
        {cat.title}
      </h3>
        <ul>
          {#each cat.examples as module (module.slug)}
            <li 
              class:active={example === module} 
              on:click={() => {example = module; category = cat}}
            >
              {module.title}
              <span class="fa fa-code-branch"></span>
            </li>
          {/each}
        </ul>
    </div>
  {/each}
{/if}
