const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Lancer le navigateur
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    // URL de la page Overwatch Wiki
    const url = 'https://overwatch.fandom.com/wiki/Overwatch_Wiki';
    await page.goto(url, {waitUntil: 'domcontentloaded'});

    // Extraire les noms des personnages
    const heroNames = await page.evaluate(() => {
        // Sélectionner les éléments qui contiennent les noms des héros
        const heroes = [...document.querySelectorAll('.hero-label a')];
        // Récupérer les noms des personnages en extrayant le texte de chaque élément
        return heroes.map(hero => hero.textContent.trim());
    });

    // Log the number of hero names found
    console.log(`${heroNames.length} hero names found.`);

    // Sauvegarder les noms dans un fichier JSON
    fs.writeFileSync('public/datas/heroNames.json', JSON.stringify(heroNames, null, 2));

    console.log('Hero names saved to public/datas/heroNames.json.');

    // Fermer le navigateur
    await browser.close();
})();
