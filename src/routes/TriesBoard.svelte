<script lang="ts">
	// Importer les données des personnages
	import characterData from '$lib/datas/charactersDatas.json';

	// Recevoir les essais en tant que prop
	export let heroes: { name: string; imageUrl: string; }[] = [];

	function cutString(str: string) {
		const index = Math.min(
			str.indexOf('[') !== -1 ? str.indexOf('[') : str.length,
			str.indexOf('(') !== -1 ? str.indexOf('(') : str.length
		);
		return index !== str.length ? str.substring(0, index).trim() : str;
	}

	const headers = [
		'Hero',
		'Role',
		'Nationality',
		'Age',
		'Health'
	];
</script>

<div class="tries-board">
	{#if heroes.length > 0}
		<h3>Tries</h3>
		<table class="hero-table">
			<thead>
			<tr>
				{#each headers as header}
					<th>{header}</th>
				{/each}
			</tr>
			</thead>
			<tbody>
			{#each heroes as hero}
				<tr>
					{#each headers as header}
						<!--						todo: find a way to display health from open queue & role queue-->
						{#if header === 'Hero'}
							<td class="hero-image">
								<div class="image-wrapper">
									<img src={hero.imageUrl} class="hero-icon" alt="{hero.name} icon"/>
									<span class="hero-name-tooltip">{hero.name}</span>
								</div>
							</td>
						{:else}
							<td>{cutString(characterData[hero.name]?.[header] || '❌')}</td>
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
	}

	.tries-board h3 {
		margin-bottom: 10px;
		text-align: center;
	}

	.hero-table {
		width: 100%;
		border-collapse: collapse;
	}

	.hero-table th,
	.hero-table td {
		padding: 10px;
		border-bottom: 1px solid #444;
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
		color: #ccc;
	}

	.hero-table tr:hover {
		background-color: #444;
	}
</style>
