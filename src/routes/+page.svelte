<script>
	import Counter from './Counter.svelte';
	// todo: create overdle logo (overwatch, cross out watch and write dle under)
	import ow_logo from '$lib/images/Overwatch-Logo.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="header">
		<img src={ow_logo} alt="Overwatch logo" width="60%" />

		to your new<br />SvelteKit app
	</div>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<Counter />
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0.6;
				width: 100%;
    }

    h1 {
        width: 100%;
    }

    .welcome {
        display: block;
        position: relative;
        width: 100%;
        height: 0;
        padding: 0 0 calc(100% * 495 / 2048) 0;
    }

    .header {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: 100%;
		}
</style>
