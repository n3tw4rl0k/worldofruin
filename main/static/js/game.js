document.addEventListener('DOMContentLoaded', function() {
    const moveButtons = document.querySelectorAll('.movement-controls button');
    const MINIMAP_SIZE = 200;
    let isZoomedIn = false;
    let discoveredLocations = {};
    let currentCoords = [0, 0];
    let currentMonster = null;
    let qteSequence = [];
    let qteIndex = 0;
    let qteTimer = null;
    let qteStartTime = null;
    let lives = 5;
    let maxQteTime = 11000; // 10 seconds


    const zoneColors = {
        "Red Desert": "#FF4500",
        "Coastal Ruins": "#4169E1",
        "Thunder Peaks": "#FFD700",
        "Dead Wastes": "#8B008B",
        "Arcane Sanctum": "#00FFFF"
    };

    const subZoneColors = {
        "Dunes of Silence": "#FFA07A",
        "Scorching Sun Canyon": "#FF6347",
        "Moon Oasis": "#F0E68C",
        "Sea of Glass": "#E9967A",
        "Ghost Cliffs": "#B0E0E6",
        "Shipwreck Beach": "#4682B4",
        "Siren's Bay": "#1E90FF",
        "Kraken Isle": "#00BFFF",
        "Lightning Peak": "#FFD700",
        "Cavern of Echoes": "#DAA520",
        "Dragon Valley": "#FFA500",
        "Storm Crags": "#F4A460",
        "Ruined City": "#8B008B",
        "Rotting Forest": "#9932CC",
        "Field of Bones": "#BA55D3",
        "Shadow Rift": "#9400D3",
        "Arcane Temple": "#00FFFF",
        "Astral Tower": "#40E0D0",
        "Force Field": "#48D1CC",
        "Mana Mine": "#00CED1"
    };

    function initializeGame() {
        movePlayer('initial');
    }

    function movePlayer(direction) {
        fetch('/main/game/move/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `direction=${direction}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.game_over) {
                showFinalMessage(data.warning);
            } else if (data.error) {
                showErrorMessage(data.error);
            } else {
                updateLocationInfo(data);
                discoveredLocations = {...discoveredLocations, ...data.discovered_locations};
                currentCoords = data.current_coords;
                updateMiniMap(discoveredLocations, currentCoords);
                updateMoveButtons(data.neighbors);
                updateCharacterInfo(data.character);
                updateMonsterInfo(data.location_monster);

                if (data.warning) {
                    showWarningMessage(data.warning);
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function showFinalMessage(message) {
        const overlay = document.createElement('div');
        overlay.className = 'final-message-overlay';

        const messageBox = document.createElement('div');
        messageBox.className = 'final-message';

        const text = document.createElement('p');
        text.textContent = message;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.className = 'final-message-ok-button';
        okButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            window.location.href = '/main/game/over/';
        });

        messageBox.appendChild(text);
        messageBox.appendChild(okButton);
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    }

    function showWarningMessage(message) {
        const overlay = document.createElement('div');
        overlay.className = 'warning-overlay';

        const messageBox = document.createElement('div');
        messageBox.className = 'warning-message';

        const text = document.createElement('p');
        text.textContent = message;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.className = 'warning-ok-button';
        okButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        messageBox.appendChild(text);
        messageBox.appendChild(okButton);
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    }

    const characterDetailsButton = document.querySelector('.character-details-button');
    const characterDetailsPopup = document.querySelector('.character-details-popup');
    const closeCharacterDetailsButton = document.getElementById('close-character-details');

    characterDetailsButton.addEventListener('click', function() {
        updateCharacterPopup();
        characterDetailsPopup.style.display = 'block';
    });

    closeCharacterDetailsButton.addEventListener('click', function() {
        characterDetailsPopup.style.display = 'none';
    });

   function updateCharacterInfo(character) {
        document.getElementById('char_level').textContent = `Level: ${character.level}`;
        document.getElementById('char_xp').textContent = `XP: ${character.xp} / ${character.xp_to_next_level}`;
        document.getElementById('char_strength').textContent = `STR: ${character.strength}`;
        document.getElementById('char_dexterity').textContent = `DEX: ${character.dexterity}`;
        document.getElementById('char_intelligence').textContent = `INT: ${character.intelligence}`;
   }

    function updateCharacterPopup() {
        document.getElementById('popup_char_level').textContent = document.getElementById('char_level').textContent;
        document.getElementById('popup_char_xp').textContent = document.getElementById('char_xp').textContent;
        document.getElementById('popup_char_strength').textContent = document.getElementById('char_strength').textContent;
        document.getElementById('popup_char_dexterity').textContent = document.getElementById('char_dexterity').textContent;
        document.getElementById('popup_char_intelligence').textContent = document.getElementById('char_intelligence').textContent;
    }

    function showErrorMessage(message) {
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';

        const messageBox = document.createElement('div');
        messageBox.className = 'error-message';

        const text = document.createElement('p');
        text.textContent = message;

        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.className = 'error-ok-button';
        okButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        messageBox.appendChild(text);
        messageBox.appendChild(okButton);
        overlay.appendChild(messageBox);
        document.body.appendChild(overlay);
    }

    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const direction = this.id.replace('move-', '');
            movePlayer(direction);
        });
    });

    function updateLocationInfo(data) {
        if (data && typeof data === 'object') {
            const locationInfo = document.querySelector('.location-info');

            const subZoneElement = locationInfo.querySelector('h2');
            if (subZoneElement) subZoneElement.textContent = data.sub_zone || 'Unknown Location';

            const descriptionElement = locationInfo.querySelector('p:nth-child(2)');
            if (descriptionElement) descriptionElement.textContent = data.description || 'No description available';

            const levelElement = locationInfo.querySelector('p:nth-child(3)');
            if (levelElement) levelElement.textContent = `Level: ${data.level || 'Unknown'}`;

            const monstersElement = locationInfo.querySelector('p:nth-child(4)');
            if (monstersElement) {
                const monsters = Array.isArray(data.monsters) ? data.monsters.join(", ") : 'No monsters';
                monstersElement.textContent = `Monsters: ${monsters}`;
            }

            const dungeonElement = locationInfo.querySelector('h3');
            const dungeonDescriptionElement = locationInfo.querySelector('h3 + p');
            if (data.dungeon) {
                dungeonElement.style.display = '';
                dungeonDescriptionElement.style.display = '';
                dungeonElement.textContent = `Dungeon: ${data.dungeon.name || 'Unknown Dungeon'}`;
                dungeonDescriptionElement.textContent = data.dungeon.description || 'No dungeon description available';
            } else {
                dungeonElement.style.display = 'none';
                dungeonDescriptionElement.style.display = 'none';
            }
            const coordsElement = locationInfo.querySelector('#coords');
            if (coordsElement) coordsElement.textContent = `Coordinates: (${data.current_coords[0]}, ${data.current_coords[1]})`;

            const zone = data.zone || 'Unknown';
            updateZoneImage(zone, data.sub_zone);
        } else {
            console.error('Invalid data received from server');
        }
    }

    function updateMoveButtons(neighbors) {
        const directions = ['up', 'down', 'left', 'right'];
        directions.forEach(direction => {
            const button = document.getElementById(`move-${direction}`);
            if (button) {
                if (neighbors[direction]) {
                    button.classList.remove('disabled');
                } else {
                    button.classList.add('disabled');
                }
            }
        });
    }

    function updateMiniMap(discoveredLocations, currentCoords) {
        const mapContainer = document.getElementById('map-container');
        mapContainer.innerHTML = '';

        mapContainer.style.width = `${MINIMAP_SIZE}px`;
        mapContainer.style.height = `${MINIMAP_SIZE}px`;
        mapContainer.style.display = 'grid';

        const gridSize = isZoomedIn ? 5 : 10;
        const cellSize = MINIMAP_SIZE / gridSize;

        mapContainer.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;
        mapContainer.style.gridTemplateRows = `repeat(${gridSize}, ${cellSize}px)`;

        const offset = Math.floor(gridSize / 2);

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = document.createElement('div');
                cell.classList.add('map-cell');
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;

                const mapX = currentCoords[0] - offset + x;
                const mapY = currentCoords[1] + offset - y;

                const locationKey = `${mapX}_${mapY}`;
                if (mapX === currentCoords[0] && mapY === currentCoords[1]) {
                    cell.classList.add('current-location');
                } else if (discoveredLocations[locationKey]) {
                    const locationInfo = discoveredLocations[locationKey];
                    const bgColor = isZoomedIn ? subZoneColors[locationInfo.sub_zone] : zoneColors[locationInfo.zone];
                    cell.style.backgroundColor = bgColor || '#333';
                    cell.classList.add('discovered-location');

                    if (isZoomedIn) {
                        const acronym = getAcronym(locationInfo.sub_zone);
                        cell.textContent = acronym;
                        cell.style.color = getContrastColor(bgColor);
                        cell.style.display = 'flex';
                        cell.style.justifyContent = 'center';
                        cell.style.alignItems = 'center';
                        cell.style.fontSize = `${cellSize / 3}px`;
                    }
                } else {
                    cell.classList.add('undiscovered-location');
                }

                mapContainer.appendChild(cell);
            }
        }
    }

    document.getElementById('toggle-zoom').addEventListener('click', function(event) {
        event.preventDefault();
        isZoomedIn = !isZoomedIn;
        updateMiniMap(discoveredLocations, currentCoords);
    });

    function getContrastColor(hexcolor) {
        if (!hexcolor || !/^#[0-9A-F]{6}$/i.test(hexcolor)) {
            return '#000000';
        }

        let r = parseInt(hexcolor.substr(1, 2), 16);
        let g = parseInt(hexcolor.substr(3, 2), 16);
        let b = parseInt(hexcolor.substr(5, 2), 16);

        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    function updateZoneImage(zone, subZone) {
        const zoneImage = document.getElementById('zone-image');

        if (!zone || zone === 'undefined' || !subZone || subZone === 'undefined') {
            zoneImage.src = '/static/map/default.png';
            return;
        }

        const safeZone = zone.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const safeSubZone = subZone.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

        const imagePath = `/static/map/${safeZone}_${safeSubZone}.png`;

        fetch(imagePath)
            .then(response => {
                if (response.ok) {
                    zoneImage.src = imagePath;
                } else {
                    zoneImage.src = '/static/map/default.png';
                }
            })
            .catch(() => {
                zoneImage.src = '/static/map/default.png';
            });
    }

    function getAcronym(str) {
        return str.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '');
    }

    initializeGame();

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function updateMonsterInfo(monster) {
        const monsterTypeElement = document.getElementById('monster-type');
        const monsterLevelElement = document.getElementById('monster-level');
        const attackButton = document.getElementById('attack-button');

        if (monster && monsterTypeElement && monsterLevelElement && attackButton) {
            monsterTypeElement.querySelector('span').textContent = monster.type || 'Unknown';
            monsterLevelElement.querySelector('span').textContent = monster.level || 'Unknown';
            attackButton.style.display = 'block';
            currentMonster = monster;
        } else {
            if (monsterTypeElement) monsterTypeElement.querySelector('span').textContent = 'None';
            if (monsterLevelElement) monsterLevelElement.querySelector('span').textContent = '-';
            if (attackButton) attackButton.style.display = 'none';
            currentMonster = null;
        }
    }

    document.getElementById('attack-button').addEventListener('click', function() {
        if (currentMonster) {
            startBattle();
        }
    });

    function startBattle() {
        const imageContainer = document.querySelector('.image-container');
        const zoneImage = document.getElementById('zone-image');
        const monsterImagePath = `/static/monsters/${currentMonster.type.toLowerCase().replace(/ /g, '_')}.png`;

        const transitionEffects = ['pixelate', 'whirlpool', 'smudge'];
        const randomEffect = transitionEffects[Math.floor(Math.random() * transitionEffects.length)];

        imageContainer.classList.add(randomEffect);

        setTimeout(() => {
            zoneImage.src = monsterImagePath;
            imageContainer.classList.remove(randomEffect);
            startQTE();
        }, 1000);
    }

    function startQTE() {
        lives = getMaxLives();
        qteSequence = generateQTESequence();
        qteIndex = 0;
        displayQTEInstructions();
        startQTETimer();

        document.addEventListener('keydown', handleQTEKeyPress);
    }

    function getMaxLives() {
        const level = currentMonster.level;
        if (level <= 20) return 5;
        if (level <= 40) return 4;
        if (level <= 60) return 3;
        if (level <= 80) return 2;
        return 1;
    }

    function generateQTESequence() {
        const level = currentMonster.level;
        let sequenceLength = Math.min(9, Math.floor(level / 3) + 1);
        let sequence = [];

        const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        for (let i = 0; i < sequenceLength; i++) {
            sequence.push(arrowKeys[Math.floor(Math.random() * arrowKeys.length)]);
        }

        if (level > 28) {
            const extraChars = 'qwertyuio12345'.split('');
            const extraCount = Math.min(Math.floor((level - 28) / 5), extraChars.length);
            for (let i = 0; i < extraCount; i++) {
                sequence.push(extraChars[i]);
            }
        }

        return shuffleArray(sequence);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayQTEInstructions() {
        const qteContainer = document.createElement('div');
        qteContainer.id = 'qte-container';
        qteContainer.innerHTML = `
            <h3>Press the following keys:</h3>
            <div id="qte-sequence"></div>
            <div id="qte-timer"></div>
            <div id="qte-lives">Lives: ${lives}</div>
        `;
        document.body.appendChild(qteContainer);

        updateQTEDisplay();
    }

    function updateQTEDisplay() {
        const qteSequenceElement = document.getElementById('qte-sequence');
        qteSequenceElement.innerHTML = qteSequence.map((key, index) =>
            `<span class="${index < qteIndex ? 'completed' : index === qteIndex ? 'current' : ''}">${key}</span>`
        ).join(' ');
    }

    function startQTETimer() {
        const timerElement = document.getElementById('qte-timer');
        const totalTime = getQTETime();
        qteStartTime = Date.now();

        qteTimer = setInterval(() => {
            const elapsed = Date.now() - qteStartTime;
            const remaining = Math.max(0, totalTime - elapsed);
            const percentage = (remaining / totalTime) * 100;

            timerElement.style.width = `${percentage}%`;

            if (remaining === 0) {
                clearInterval(qteTimer);
                handleQTEFailure();
            }
        }, 50);
    }

    function getQTETime() {
        const level = currentMonster.level;
        if (level > 90) {
            return maxQteTime - 1000;
        }
        return maxQteTime;
    }

    function handleQTEKeyPress(event) {
        if (event.key === qteSequence[qteIndex]) {
            qteIndex++;
            updateQTEDisplay();

            if (qteIndex === qteSequence.length) {
                handleQTESuccess();
            }
        } else {
            lives--;
            document.getElementById('qte-lives').textContent = `Lives: ${lives}`;

            if (lives === 0) {
                handleQTEFailure();
            }
        }
    }

    function handleQTESuccess() {
        clearInterval(qteTimer);
        document.removeEventListener('keydown', handleQTEKeyPress);
        document.getElementById('qte-container').remove();

        fetch('/main/game/attack/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'qte_result=success'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(`You defeated the ${currentMonster.type}! Gained ${data.xp_gained} XP.`);
                updateCharacterInfo(data.character);
            } else {
                showMessage('An error occurred. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function updateCharacterInfo(character) {
        document.getElementById('char_level').textContent = `Level: ${character.level}`;
        document.getElementById('char_xp').textContent = `XP: ${character.xp} / ${character.xp_to_next_level}`;
        document.getElementById('char_strength').textContent = `STR: ${character.strength}`;
        document.getElementById('char_dexterity').textContent = `DEX: ${character.dexterity}`;
        document.getElementById('char_intelligence').textContent = `INT: ${character.intelligence}`;
    }

    function handleQTEFailure() {
        clearInterval(qteTimer);
        document.removeEventListener('keydown', handleQTEKeyPress);
        document.getElementById('qte-container').remove();

        fetch('/main/game/attack/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'qte_result=failure'
        })
        .then(response => response.json())
        .then(data => {
            if (data.game_over) {
                showMessage('You were defeated! Returning to the starting area...');
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                showMessage('An error occurred. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function showMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message';
        messageElement.textContent = message;
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
});