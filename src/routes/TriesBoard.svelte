<script lang="ts">
	// Import scraped datas
	import characterData from '$lib/datas/charactersDatas.json';
	import { getCookie, isClient, setCookie } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	let dailyHero;

	function getRandomHero() {
		// return a random object from characterData to get every fields, not only the hero name
		const heroes = Object.values(characterData);
		const names = Object.keys(characterData);
		const randomIndex = Math.floor(Math.random() * heroes.length);
		return { name: names[randomIndex], datas: heroes[randomIndex] };
	}

	// Generate or retrieve the daily hero from a cookie
	function getDailyHero() {
		if (isClient) {
			const today = new Date().toISOString().split('T')[0]; // Date format: YYYY-MM-DD
			const savedHero = getCookie('dailyHero');

			if (savedHero && savedHero.date === today) {
				return savedHero.hero;
			} else {
				const randomHero = getRandomHero();
				setCookie('dailyHero', { hero: randomHero, date: today }, 1);
				return randomHero;
			}
		}
		return null;
	}

	onMount(() => {
		dailyHero = getDailyHero();
	});

	// Receive the list of tried heroes
	export let heroes: { name: string; imageUrl: string; }[] = [];

	function cutString(str: string) {
		const index = Math.min(
			str.indexOf('[') !== -1 ? str.indexOf('[') : str.length,
			str.indexOf('(') !== -1 ? str.indexOf('(') : str.length
		);
		return index !== str.length ? str.substring(0, index).trim() : str;
	}

	function getHealth(str: string) {
		const openQueueIndex = str.indexOf('(Open queue)');
		const roleQueueIndex = str.indexOf('(Role queue)');
		if (openQueueIndex !== -1 && roleQueueIndex !== -1) {
			return str.substring(openQueueIndex + 12, roleQueueIndex).trim();
		}
		return str;
	}

	const headers = [
		'Hero',
		'Role',
		'Nationality',
		'Age',
		'Health',
		'Shields',
		'Armor'
	];

	function getValidity(value: string, header: string) {
		let dailyValue = dailyHero?.datas[header];
		if (dailyValue === undefined) {
			return '';
		}
		if (header === 'Health') {
			dailyValue = getHealth(dailyValue);
		} else {
			dailyValue = cutString(dailyValue || '❌');
		}
		// return value === dailyValue ? 'valid' : 'invalid';
		// if both values are the same, return 'valid', else return 'invalid'
		// if both values are numbers, compare them as numbers (lower, greater, valid)
		if (!isNaN(Number(value)) && !isNaN(Number(dailyValue))) {
			if (Number(dailyValue) < Number(value)) {
				return 'lower';
			} else if (Number(dailyValue) > Number(value)) {
				return 'greater';
			} else {
				return 'valid';
			}
		}
		// if both values are strings, compare them as strings (valid, invalid)
		return value === dailyValue ? 'valid' : 'invalid';
	}
</script>

<div class="tries-board">
	{#if heroes.length > 0}
		<h3>Tries</h3>
		<table class="hero-table" cellspacing="0">
			<thead>
			<tr>
				{#each headers as header}
					<th>{header}</th>
				{/each}
			</tr>
			</thead>
			<tbody>
			{#each heroes.slice().reverse() as hero}
				<tr class="row">
					{#each headers as header}
						{#if header === 'Hero'}
							<td class="hero-image">
								<div class="image-wrapper">
									<img src={hero.imageUrl} class="hero-icon" alt="{hero.name} icon" />
									<span class="hero-name-tooltip">{hero.name}</span>
								</div>
							</td>
						{:else if header === 'Health'}
							<td data-type="{header}"
							    class="{getValidity(getHealth(characterData[hero.name]?.['Health']), header)}">{getHealth(characterData[hero.name]?.['Health'])}</td>
						{:else}
							<td data-type="{header}"
							    class="{getValidity(cutString(characterData[hero.name]?.[header] || '❌'), header)}">{cutString(characterData[hero.name]?.[header] || '❌')}</td>
						{/if}
					{/each}
				</tr>
			{/each}
			</tbody>
		</table>
	{:else}
		<p>No tries yet. Start by adding a hero!</p>
	{/if}
</div>

<style>
	.tries-board {
		margin-top: 20px;
		background-color: #222;
		padding: 10px;
		border-radius: 5px;
		color: #fff;
		text-transform: uppercase;
		border: var(--color-theme-1) solid 1px;
	}

	.tries-board h3 {
		text-align: center;
	}

	.hero-table {
		width: 100%;
		border-collapse: collapse;
	}

	.row:not(:last-child) {
		border-bottom: 1px solid var(--color-theme-1);
	}

	.hero-table th,
	.hero-table td {
		padding: 10px;
	}

	.hero-image {
		position: relative;
	}

	.image-wrapper {
		position: relative;
		display: inline-block;
	}

	.hero-icon {
		width: 40px;
		height: 40px;
		border-radius: 4px;
		transition: transform 0.2s ease-in-out;
	}

	.hero-icon:hover {
		transform: scale(1.1);
	}

	.hero-name-tooltip {
		visibility: hidden;
		width: 100px;
		background-color: #555;
		color: #fff;
		text-align: center;
		border-radius: 6px;
		padding: 5px;
		position: absolute;
		bottom: 120%;
		left: 50%;
		margin-left: -50px;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.image-wrapper:hover .hero-name-tooltip {
		visibility: visible;
		opacity: 1;
	}

	.hero-table th {
		background-color: #333;
	}

	.hero-table td {
		color: #ffffff;
	}

	.hero-table tr:hover {
		background-color: #444;
	}

	.invalid {
		background: var(--red);
	}

	.valid {
		background: var(--green);
	}

	.lower, .greater {
		background: var(--orange);
	}

	.invalid, .valid, .lower, .greater, td {
		min-width: 6rem;
		max-width: 6rem;
		position: relative;
		background-clip: content-box;
		border-radius: 15px;
	}

	.lower::after {
		position: absolute;
		top: 1px;
		left: 25%;
		width: 50%;
		clip-path: polygon(97% 60%, 80% 60%, 80% 5%, 20% 5%, 20% 60%, 3% 60%, 50% 95%);
		-webkit-clip-path: polygon(97% 60%, 80% 60%, 80% 5%, 20% 5%, 20% 60%, 3% 60%, 50% 95%);
		height: 100%;
		background: rgba(0, 0, 0, 0.48);
		content: "";
		opacity: 0.5;
		transition: background-color .3s ease;
	}

	.greater::after {
		position: absolute;
		top: 1px;
		left: 25%;
		width: 50%;
		clip-path: polygon(97% 40%, 80% 40%, 80% 95%, 20% 95%, 20% 40%, 3% 40%, 50% 5%);
		-webkit-clip-path: polygon(97% 40%, 80% 40%, 80% 95%, 20% 95%, 20% 40%, 3% 40%, 50% 5%);
		height: 100%;
		background: rgba(0, 0, 0, 0.48);
		content: "";
		opacity: 0.5;
		transition: background-color .3s ease;
	}
</style>
