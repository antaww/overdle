<script lang="ts">
	import heroes from '$lib/datas/heroes.json';
	import { onMount, tick } from 'svelte';
	import TriesBoard from './TriesBoard.svelte';
	import { getCookie, isClient } from '$lib/utils/utils';

	let query = '';
	let suggestions: any[] = [];
	let tries: string[] = []; // Stock the list of tried heroes
	let invalidInput = false; // State to trigger the shake animation

	// Load tries from the cookie on page load
	const loadTries = () => {
		if (isClient) {
			const savedTries = getCookie('tries');
			if (savedTries.length > 0) {
				tries = savedTries;
			}
		}
	};

	onMount(() => {
		loadTries();
	});

	// Filter heroes based on the query and exclude already tried heroes
	const filterSuggestions = () => {
		suggestions = query.length > 0
			? heroes.filter(hero =>
				hero.name.toLowerCase().includes(query.toLowerCase()) &&
				!tries.some(triedHero => triedHero.name === hero.name)
			).sort()
			: [];
	};

	// Send a POST request to the server
	const sendTry = async (hero: string) => {
		// Vérifier si le nom est valide
		if (!heroes.some(h => h.name === hero)) {
			invalidInput = true;
			await tick();
			setTimeout(() => {
				invalidInput = false;
			}, 500);
			return;
		}

		// Add the hero to the list of tries
		if (!tries.some(h => h.name === hero)) {
			tries = [...tries, heroes.find(h => h.name === hero)];
			document.cookie = `tries=${JSON.stringify(tries)}; path=/`;
			// close the suggestions
			suggestions = [];
		}

		query = '';

	};

	const handleSubmit = (event: Event) => {
		event.preventDefault();
		sendTry(query);
	};

	const handleSuggestionClick = (hero) => {
		query = hero.name;
		sendTry(hero.name);
	};
</script>

<div class="autocomplete">
	<form on:submit={handleSubmit}>
		<div class="error-message"
		     style="visibility: {invalidInput ? 'visible' : 'hidden'}; opacity: {invalidInput ? 1 : 0};">
			Invalid hero name
		</div>
		<input class="{invalidInput ? 'shake' : ''}"
		       type="text"
		       bind:value={query}
		       on:input={filterSuggestions}
		       placeholder="Type hero name..."
		/>
	</form>

	{#if suggestions.length > 0}
		<div class="suggestions">
			<ul>
				{#each suggestions as hero}
					<li on:click={() => handleSuggestionClick(hero)}>
						<img src={hero.imageUrl} alt={hero.name} width="30" height="30" /> {hero.name}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

</div>
<TriesBoard bind:heroes={tries} />

<style>
	.autocomplete {
		position: relative; /* To contain the absolute positioned suggestions div */
	}

	input {
		padding: 8px;
		margin-bottom: 10px;
		font-size: 1rem;
	}

	.suggestions {
		position: absolute;
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
		display: flex;
		gap: 10px;
		align-items: center;
		padding: 8px;
		background-color: #0c0c0c;
		margin-bottom: 5px;
		cursor: pointer;
		transition: background-color 0.2s linear;
		text-transform: uppercase;
	}

	li:hover {
		background-color: #171616;
	}

	/* Animation shake */
	@keyframes shake {
		0%, 100% {
			transform: translateX(0);
		}
		20%, 60% {
			transform: translateX(-6px);
		}
		40%, 80% {
			transform: translateX(6px);
		}
	}

	input {
		border: 1px solid #ccc;
		color: #ccc;
		background: #0c0c0c;
		transition: all 0.4s ease;
	}

	.shake {
		animation: shake 0.3s;
		border-color: #c21515;
		color: #c21515;
		background: #2c2c2c;
	}

	.error-message {
		transition: all 1s ease;
		position: absolute;
		top: -25px; /* Adjust depending on your design */
		left: 0;
		right: 0;
		color: #c21515;
		background-color: #2c2c2c;
		padding: 5px;
		border-radius: 4px;
		text-align: center;
		font-size: 0.85rem;
		z-index: 200; /* Ensure it appears on top */
	}
</style>
