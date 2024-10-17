<script lang="ts">
	import heroNames from '$lib/datas/heroNames.json';

	let query = '';
	let suggestions: string[] = [];

	// Filter suggestions based on the query
	const filterSuggestions = () => {
		suggestions = query.length > 0
			? heroNames.filter(hero => hero.toLowerCase().includes(query.toLowerCase())).sort()
			: [];
	};
</script>

<div class="autocomplete">
	<input
			type="text"
			bind:value={query}
			on:input={filterSuggestions}
			placeholder="Type hero name..."
	/>

	{#if suggestions.length > 0}
		<div class="suggestions">
			<ul>
				{#each suggestions as suggestion}
					<li>{suggestion}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.autocomplete {
		position: relative; /* To contain the absolute positioned suggestions div */
	}

	input {
		padding: 8px;
		width: 100%;
		margin-bottom: 10px;
		font-size: 1rem;
	}

	.suggestions {
		position: absolute;
		top: 100%; /* Start the dropdown right below the input */
		left: 0;
		right: 0;
		background-color: #0c0c0c;
		border: 1px solid #ccc;
		max-height: 200px; /* Limit the height of the suggestion box */
		overflow-y: auto; /* Enable scrolling if the list is too long */
		z-index: 100; /* Ensure it appears above other content */
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 8px;
		background-color: #0c0c0c;
		margin-bottom: 5px;
		cursor: pointer;
		transition: background-color 0.2s linear;
	}

	li:hover {
		background-color: #171616;
	}
</style>
