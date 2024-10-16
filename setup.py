import subprocess
import os
from loguru import logger

# Fonction pour exécuter une commande shell
def run_command(command):
    try:
        logger.info(f"Exécution de la commande : {command}")
        result = subprocess.check_call(command, shell=True)
        logger.success(f"Commande exécutée avec succès : {command}")
    except subprocess.CalledProcessError as e:
        logger.error(f"Erreur lors de l'exécution de la commande : {e.cmd}")
        logger.error(f"Code de retour : {e.returncode}")
        logger.error(f"Sortie standard : {e.stdout}")
        logger.error(f"Erreur standard : {e.stderr}")
        raise

# Chemin du projet (racine du projet)
project_root = os.path.dirname(os.path.abspath(__file__))

# Se déplacer dans le répertoire racine du projet
os.chdir(project_root)

# Exécuter 'npm install'
logger.info("Exécution de 'npm install'...")
run_command("npm install")

# Exécuter 'node scripts/characters_scraper.js'
logger.info("Exécution de 'node scripts/characters_scraper.js'...")
run_command("node scripts/characters_scraper.js")

# Exécuter 'node scripts/info_scraper.js'
logger.info("Exécution de 'node scripts/info_scraper.js'...")
run_command("node scripts/info_scraper.js")

logger.info("Setup du projet terminé.")
