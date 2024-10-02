const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // Charger les noms des personnages depuis le fichier JSON
    const heroNames = JSON.parse(fs.readFileSync('../datas/heroNames.json', 'utf8'));

    // Initialiser un objet pour stocker toutes les données des personnages
    const charactersDatas = {};

    // Lancer le navigateur
    const browser = await puppeteer.launch();

    for (const heroName of heroNames) {
        /* if (heroName != "Mercy") {
            continue;
        } */
        
        const formattedHeroName = heroName.replace(/\s+/g, '_'); // Remplacer les espaces par des underscores
        const url = `https://overwatch.fandom.com/wiki/${formattedHeroName}`;

        const page = await browser.newPage();
        try {
            console.log(`Scraping data for: ${heroName}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Extraire les informations du personnage
            const characterData = await page.evaluate(() => {
                const rows = [...document.querySelectorAll('tbody tr')];  // Sélectionne tous les éléments <tr> dans <tbody>

                const getInfo = (label) => {
                    const row = rows.find(row => row.innerText.includes(label));
                    return row ? row.querySelector('td:last-child')?.textContent.trim() : null;
                };

                // Fonction pour extraire les capacités & armes
                const getWeaponInfo = () => {
                    const weapons = [];
                    // Key mouse 1 is used to identify weapons, key mouse 2 is also used to identify alt fire (like Moira, Widowmaker, Soldier...)
                    document.querySelectorAll('img[alt="Key mouse 1"], img[alt="Key mouse 2"]').forEach(img => {
                        const weaponContainer = img.closest('.ability_box');
                        if (weaponContainer) {
                            const weaponName = weaponContainer.querySelector('.abilityHeader')?.innerText.trim();
                            const weaponDescription = weaponContainer.querySelector('.summaryInfoAndImage i')?.innerText.trim();
                            const weaponType = weaponContainer.querySelector('.summaryInfoAndImage span')?.innerText.trim();

                            // Initialize stats object
                            const stats = {};

                            // Get the stats container (the next div after summaryInfoAndImage)
                            const statsContainer = weaponContainer.querySelector('.summaryInfoAndImage').nextElementSibling;

                            // Find all stats by iterating through each child div
                            const statDivs = statsContainer.querySelectorAll('div[style*="display:block"]');
                            statDivs.forEach(statDiv => {
                                const statName = statDiv.querySelector('b')?.innerText.trim();
                                const statValue = statDiv.querySelector('div:nth-child(2)')?.innerText.trim();
                                if (statName && statValue) {
                                    stats[statName] = statValue;
                                }
                            });

                            if (weaponName && weaponDescription && weaponType) {
                                const isDuplicate = weapons.some(item => item.name === weaponName);

                                if (!isDuplicate) {
                                    weapons.push({ 
                                        name: weaponName, 
                                        description: weaponDescription, 
                                        weaponType,
                                        stats
                                    });
                                }
                            }
                        }
                    });
                    return weapons.length > 0 ? weapons : null;
                };
                
                const getAbilityInfo = () => {
                    const abilities = [];
                    document.querySelectorAll('span[title="Hotkey"]').forEach(span => {
                        const abilityContainer = span.closest('.ability_box');
                        if (abilityContainer) {
                            const abilityName = abilityContainer.querySelector('.abilityHeader')?.innerText.trim();
                            const abilityDescription = abilityContainer.querySelector('.summaryInfoAndImage i')?.innerText.trim();
                            const hotkey = span.querySelector('.keybind')?.innerText.trim(); // Récupérer la touche
                
                            if (abilityName && abilityDescription && hotkey) {
                                // Vérifier si la capacité est déjà dans le tableau
                                if (!abilities.some(item => item.name === abilityName)) {
                                    abilities.push({ name: abilityName, description: abilityDescription, hotkey });
                                }
                            }
                        }
                    });
                    return abilities.length > 0 ? abilities : null;
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
                    Shields: getInfo('Shields') || null,
                    Weapons: getWeaponInfo() || null,
                    Abilities: getAbilityInfo() || null
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
    fs.writeFileSync('../' + savePath, JSON.stringify(charactersDatas, null, 2));

    console.log('All characters data saved successfully!');

    // Fermer le navigateur après avoir fini de scraper tous les personnages
    await browser.close();
})();
