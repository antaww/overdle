const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Lancer le navigateur
    const browser = await puppeteer.launch();
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

    // Afficher les noms extraits
    console.log(heroNames);

    // Sauvegarder les noms dans un fichier JSON
    fs.writeFileSync('datas/heroNames.json', JSON.stringify(heroNames, null, 2));

    // Fermer le navigateur
    await browser.close();
})();
