<script lang="ts">
	import heroNames from '$lib/datas/heroNames.json';
	import {tick} from 'svelte';

	let query = '';
	let suggestions: string[] = [];
	let tries: string[] = []; // Stock the list of tried heroes
	let invalidInput = false; // State to trigger the shake animation

	// Filter suggestions based on the query
	const filterSuggestions = () => {
		suggestions = query.length > 0
			? heroNames.filter(hero => hero.toLowerCase().includes(query.toLowerCase())).sort()
			: [];
	};

	// Send a POST request to the server
	const sendTry = async (hero: string) => {
		// Verify if the name is valid (in the list of heroes)
		if (!heroNames.includes(hero)) {
			invalidInput = true;
			await tick(); // Wait for the DOM to update
			setTimeout(() => {
				invalidInput = false; // Reset the state
			}, 500); // Reset the state after 500ms
			return;
		}

		// Add the hero to the list of tries
		tries = [...tries, hero];

		// Stock the list of tries in a cookie
		document.cookie = `tries=${JSON.stringify(tries)}; path=/`;

		// Send the request to the server
		try {
			const response = await fetch('/try', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({hero})
			});

			if (!response.ok) {
				throw new Error('Error sending the request');
			}

			// todo: display tried hero in a list (create tries board)

		} catch (error) {
			console.error(error);
		}
	};

	// Handle the form submission
	const handleSubmit = (event: Event) => {
		event.preventDefault();
		sendTry(query);
	};

	// Handle the click on a suggestion
	const handleSuggestionClick = (suggestion: string) => {
		query = suggestion; // Remplir l'input avec la suggestion
		sendTry(suggestion); // Envoyer la requête
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
				{#each suggestions as suggestion}
					<li on:click={() => handleSuggestionClick(suggestion)}>{suggestion}</li>
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
