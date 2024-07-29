# World of Ruin

## Game Overview

World of Ruin is a text-based, browser-based RPG set in a post-apocalyptic world. Players explore a vast, dangerous landscape filled with monsters, dungeons, and mysteries. The game combines elements of classic RPGs with modern web technologies to create an immersive and challenging experience.

## Game Design

### Setting
The game is set on Ruin, a desolate, sandy planet cloaked in perpetual danger. The world is divided into several distinct zones:

1. Red Desert: A vast and arid land with scorching heat and endless sands.
2. Coastal Ruins: A rugged coastline with treacherous cliffs and mysterious waters.
3. Thunder Peaks: Towering peaks and deep valleys filled with the echoes of ancient legends.
4. Dead Wastes: A desolate and cursed land where death and decay reign supreme.
5. Arcane Sanctum: A realm of powerful magic and mystical forces.

Each zone is further divided into sub-zones, each with its unique challenges and inhabitants.

### Gameplay Mechanics

1. **Exploration**:
   - Players navigate through the world using directional controls (up, down, left, right).
   - Each move reveals new locations and potential encounters.

2. **Character Development**:
   - Characters gain experience points (XP) through exploration and combat.
   - Leveling up improves the character's stats (Strength, Dexterity, Intelligence).

3. **Combat**:
   - Combat is based on a Quick Time Event (QTE) system.
   - When encountering a monster, players are presented with a timed challenge.
   - Players must press the correct key or sequence of keys within a time limit.
   - The difficulty of the QTE scales with the monster's level:
     - Higher-level monsters require more complex key sequences.
     - Time limits become shorter for higher-level monsters.
   - Successful QTE completion results in defeating the monster and gaining XP.
   - Failing the QTE may result in taking damage or even game over scenarios.

4. **Experience Points (XP) System**:
   - Defeating monsters awards XP based on their level relative to the player's level.
   - Fighting monsters of equal or higher level provides full XP rewards.
   - There's an XP penalty for defeating lower-level monsters:
     - The penalty scales up to a maximum of 90% XP reduction.
     - Maximum penalty applies when the player is 9 or more levels above the monster.
   - This system encourages players to seek out level-appropriate challenges.

5. **Danger Zones**:
   - As players venture into higher-level areas, they risk entering danger zones.
   - Continuous progression through danger zones can lead to game over scenarios.

6. **Minimap**:
   - A dynamically generated minimap helps players track their exploration progress and discovered locations.

7. **Dungeons**:
   - Special locations that offer greater challenges and rewards.

### Technical Implementation

- **Frontend**:
  - The game uses HTML, CSS, and JavaScript to create an interactive user interface.
  - Combat QTEs are implemented using JavaScript event listeners and timers.
- **Backend**:
  - Django (Python) powers the server-side logic, handling game state, player actions, and data persistence.
  - Combat results are processed on the server to prevent client-side manipulation.
- **Map Generation**: A procedural map generation system creates a unique world layout for each game session.
- **Monster System**: Monsters are dynamically generated with stats scaled to the zone's difficulty level.

## How to Play

1. **Start**: Begin in the Red Desert, the safest starting zone.
2. **Explore**: Use the directional buttons to move and discover new locations.
3. **Combat**:
   - When you encounter a monster, a QTE challenge will appear.
   - Pay attention to the on-screen prompts and react quickly.
   - Press the correct key(s) within the time limit to succeed.
   - Be prepared for increasing difficulty with higher-level monsters:
     - More complex key sequences
     - Shorter time limits
   - Successful QTEs defeat the monster and award XP.
   - XP rewards are highest for monsters close to or above your level.
   - Defeating much lower-level monsters yields significantly less XP.
   - Failed QTEs may result in taking damage or game over.
4. **Progress**: As you level up, explore more dangerous zones for greater challenges and rewards.
5. **Survive**: Be cautious of danger warnings and know when to retreat to safer areas.
6. **Discover**: Find and explore dungeons for unique experiences and valuable rewards.

## Installation and Setup

1. Clone the repository:
   git clone https://github.com/your-username/world-of-ruin.git
   cd world-of-ruin

2. Create and activate a virtual environment:
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`

3. Install the required dependencies:
   pip install -r requirements.txt

4. Set up the database:
   python manage.py makemigrations
   python manage.py migrate

5. Create a superuser (admin account):
   python manage.py createsuperuser

6. Run the development server:
   python manage.py runserver

### Troubleshooting

If you encounter the error "Dependency on app with no migrations: accounts", follow these steps:

1. Ensure that the 'accounts' app is listed in your `INSTALLED_APPS` in the `settings.py` file.

2. Create an initial migration for the 'accounts' app:
   python manage.py makemigrations accounts

3. Apply the migration:
   python manage.py migrate accounts

4. If the issue persists, try creating an empty migration file:
   python manage.py makemigrations accounts --empty

   Then apply the migration again:
   python manage.py migrate accounts

5. If you're still experiencing issues, check that your 'accounts' app has a `models.py` file and that it's properly defining your user model (if you're using a custom user model).

6. After resolving the 'accounts' app migration, run the general migration command again:
   python manage.py migrate

If you continue to experience issues, please check the Django documentation on migrations or seek help in the Django community forums.


## Future Enhancements

- Inventory and item system
- ~~Classes~~ , done.
- Improved combat system based also on stats and damage
- Leaderboard
- Quests
- Dungeons

## Screenshots

login:
![screenshot_login](https://github.com/user-attachments/assets/3b1cdcc4-1da4-4302-b137-aa4471a44bd2)

exploration:
![screenshot_exploration](https://github.com/user-attachments/assets/82a92622-50e0-48fd-bd51-e0fbd9e4191d)

combat:
![screenshot_combat](https://github.com/user-attachments/assets/fb0ad416-a35c-4467-a2cf-085bfefd806b)
