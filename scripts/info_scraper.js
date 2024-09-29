const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // Charger les noms des personnages depuis le fichier JSON
    const heroNames = JSON.parse(fs.readFileSync('datas/heroNames.json', 'utf8'));

    // Initialiser un objet pour stocker toutes les données des personnages
    const charactersDatas = {};

    // Lancer le navigateur
    const browser = await puppeteer.launch();

    for (const heroName of heroNames) {
        const formattedHeroName = heroName.replace(/\s+/g, '_'); // Remplacer les espaces par des underscores
        const url = `https://overwatch.fandom.com/wiki/${formattedHeroName}`;

        const page = await browser.newPage();
        try {
            console.log(`Scraping data for: ${heroName}...`);
            await page.goto(url, {waitUntil: 'domcontentloaded'});

            // Extraire les informations du personnage
            const characterData = await page.evaluate(() => {
                const rows = [...document.querySelectorAll('tbody tr')];  // Sélectionne tous les éléments <tr> dans <tbody>

                const getInfo = (label) => {
                    const row = rows.find(row => row.innerText.includes(label));
                    return row ? row.querySelector('td:last-child')?.textContent.trim() : null;
                };

                return {
                    RealName: getInfo('Real Name') || null,
                    Birth: getInfo('Birth') || null,
                    Age: getInfo('Age') || null,
                    Nationality: getInfo('Nationality') || null,
                    Occupation: getInfo('Occupation') || null,
                    Base: getInfo('Base') || null,
                    Affiliation: getInfo('Affiliation') || null,
                    Relations: getInfo('Relations') || null,
                    Voice: getInfo('Voice') || null,
                    Role: getInfo('Role') || null,
                    Health: getInfo('Health') || null,
                    Shields: getInfo('Shields') || null
                };
            });

            // Ajouter les données du personnage dans l'objet charactersDatas
            charactersDatas[heroName] = characterData;

            console.log(`Data scraped for: ${heroName}`);

        } catch (error) {
            console.error(`Failed to scrape data for: ${heroName}`, error);
        } finally {
            await page.close(); // Fermer la page après chaque personnage
        }
    }

    // Sauvegarder toutes les données dans un fichier JSON unique
    const savePath = path.join('datas', 'charactersDatas.json');
    fs.writeFileSync(savePath, JSON.stringify(charactersDatas, null, 2));

    console.log('All characters data saved successfully!');

    // Fermer le navigateur après avoir fini de scraper tous les personnages
    await browser.close();
})();
