/**
 * @file scraper.js
 * @description This script scrapes character data from the Overwatch Fandom wiki using Puppeteer.
 * It extracts various details about the characters and saves the data into a JSON file.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
	// Load hero names from the JSON file
	let heroes;
	try {
		heroes = JSON.parse(fs.readFileSync('src/lib/datas/heroes.json', 'utf8'));
	} catch (error) {
		console.error('Failed to load hero names from JSON file. ' +
			'Make sure to launch characters_scraper first.');
		process.exit(1);
	}

	// Initialize an object to store all character data
	const charactersDatas = {};

	// Launch the browser
	const browser = await puppeteer.launch({headless: "shell"});

	for (const hero of heroes) {
		const heroName = hero.name;

		// Format hero name by replacing spaces with underscores
		const formattedHeroName = heroName.replace(/\s+/g, '_');
		const url = `https://overwatch.fandom.com/wiki/${formattedHeroName}`;

		const page = await browser.newPage();
		try {
			console.log(`Scraping data for: ${heroName}...`);
			await page.goto(url, {waitUntil: 'domcontentloaded'});

			// Extract character information
			// Add character data to the charactersDatas object
			charactersDatas[heroName] = await page.evaluate(() => {
				const rows = [...document.querySelectorAll('.infoboxtable tbody tr')];  // Select all <tr> elements in <tbody>

				/**
				 * Extracts information based on the label.
				 * @param {string} label - The label to search for.
				 * @returns {string|null} - The extracted information or null if not found.
				 */
				const getInfo = (label) => {
					const row = rows.find(row => row.innerText.includes(label));
					return row ? row.querySelector('td:last-child')?.textContent.trim() : null;
				};

				/**
				 * Extracts weapon information.
				 * @returns {Array|null} - An array of weapon objects or null if no weapons found.
				 */
				const getWeaponInfo = () => {
					const weapons = [];
					// Key mouse 1 is used to identify weapons, key mouse 2 is also used to identify alt fire (like Moira, Widowmaker, Soldier...)
					document.querySelectorAll('img[alt="Key mouse 1"], img[alt="Key mouse 2"]').forEach(img => {
						const weaponContainer = img.closest('.ability_box');
						if (weaponContainer) {
							const weaponName = weaponContainer.querySelector('.abilityHeader')?.innerText.trim();
							const weaponDescription = weaponContainer.querySelector('.summaryInfoAndImage i')?.innerText.trim();
							const weaponType = weaponContainer.querySelector('.summaryInfoAndImage span:last-of-type:not([title~="Ability"])')?.innerText.trim();

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

				/**
				 * Extracts ability information.
				 * @returns {Array|null} - An array of ability objects or null if no abilities found.
				 */
				const getAbilityInfo = () => {
					const abilities = [];
					document.querySelectorAll('span[title="Hotkey"]').forEach(span => {
						const abilityContainer = span.closest('.ability_box');
						if (abilityContainer) {
							const abilityName = abilityContainer.querySelector('.abilityHeader')?.innerText.trim();
							const abilityDescription = abilityContainer.querySelector('.summaryInfoAndImage i')?.innerText.trim();
							const hotkey = span.querySelector('.keybind')?.innerText.trim(); // Get the hotkey

							if (abilityName && abilityDescription && hotkey) {
								// Check if the ability is already in the array
								if (!abilities.some(item => item.name === abilityName)) {
									abilities.push({name: abilityName, description: abilityDescription, hotkey});
								}
							}
						}
					});
					return abilities.length > 0 ? abilities : null;
				};

				// Return the extracted character data
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
					Armor: getInfo('Armor') || null,
					Weapons: getWeaponInfo() || null,
					Abilities: getAbilityInfo() || null
				};
			});

			console.log(`Data scraped for: ${heroName}`);

		} catch (error) {
			console.error(`Failed to scrape data for: ${heroName}`, error);
		} finally {
			await page.close(); // Close the page after each character
		}
	}

	// Save all character data to a single JSON file
	const savePath = path.join('src/lib/datas', 'charactersDatas.json');
	fs.writeFileSync(savePath, JSON.stringify(charactersDatas, null, 2));

	console.log('All characters data saved successfully!');

	// Close the browser after scraping all characters
	await browser.close();
})();
