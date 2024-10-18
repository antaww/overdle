const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
	// Lancer le navigateur
	const browser = await puppeteer.launch({headless: true});
	const page = await browser.newPage();

	// URL de la page Blizzard avec les héros Overwatch
	const url = 'https://overwatch.blizzard.com/en-us/heroes/';
	await page.goto(url, {waitUntil: 'domcontentloaded'});

	// Extraire les noms des personnages et leurs images
	const heroes = await page.evaluate(() => {
		// Sélectionner les conteneurs de chaque héros
		const heroCards = [...document.querySelectorAll('blz-hero-card')];

		// Récupérer les noms des héros et les URLs des images
		return heroCards.map(heroCard => {
			// Extraire le nom du héros
			const heroName = heroCard.getAttribute('hero-name');

			// Extraire l'URL de l'image du héros
			const imgElement = heroCard.querySelector('blz-image');
			const imgSrc = imgElement ? imgElement.getAttribute('src') : null;

			// Retourner un objet avec le nom et l'URL de l'image du héros
			return {
				name: heroName,
				imageUrl: imgSrc
			};
		}).filter(hero => hero.name && hero.imageUrl); // Filtrer les héros qui n'ont pas de nom ou d'image
	});

	// Log the number of hero names found
	console.log(`${heroes.length} heroes found.`);

	// Sauvegarder les données dans un fichier JSON
	fs.writeFileSync('src/lib/datas/heroes.json', JSON.stringify(heroes, null, 2));

	console.log('Heroes data saved to src/lib/datas/heroes.json.');

	// Fermer le navigateur
	await browser.close();
})();
