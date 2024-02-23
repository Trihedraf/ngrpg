const tabs = document.querySelectorAll(".tab");
const panes = document.querySelectorAll(".tab-pane");

tabs.forEach((tab, index) => {
  tab.addEventListener("click", function () {
    tabs.forEach(t => t.classList.remove("active"));
    this.classList.add("active");
    panes.forEach(pane => pane.classList.remove("active"));
    panes[index].classList.add("active");
  });
});

// Variables to store game data
let playerInventory = {};
playerInventory.helm = { name: "Helm", value: "", type: "", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.chest = { name: "Chest", value: "", type: "", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.weapon = { name: "Weapon", value: "", type: "", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.shield = { name: "Shield", value: "", type: "", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.amulet = { name: "Amulet", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.ring = { name: "Ring", prefixname: "", prefixtype: "", prefixvalue: "", suffixname: "", suffixtype: "", suffixvalue: "" };
playerInventory.newItem = null;

let player = {};
player.experience = { value: 0 };
player.level = { value: 1 };
player.maxLevel = { value: 99 };
player.strength = { value: 10 };
player.dexterity = { value: 10 };
player.magic = { value: 10 };
player.vitality = { value: 10 };
player.maxHealth = { value: player.vitality.value * 4 };
player.maxMana = { value: player.magic.value * 4 };
player.health = { value: player.maxHealth.value };
player.mana = { value: player.maxMana.value };
player.attack = { value: player.strength.value / 2 + player.dexterity.value / 4 + playerInventory.weapon.value };

let healManaCost = 200 / player.magic.value;
let currentEnemy = null;
let pointsToAdd = 0;
let experienceToLevelUp = 100;
let newItemType = null;

/* Recalculate after stat changes */
function recalculatePoints() {
  player.maxHealth.value = player.vitality.value * 4;
  player.maxMana.value = player.magic.value * 4;
  healManaCost = 200 / player.magic.value;
  player.attack.value = player.strength.value / 2 + player.dexterity.value / 4 + playerInventory.weapon.value;
}

/* Array of enemies */
const enemies = [
  {
    name: "Skeleton",
    health: 20,
    damage: 10,
    defense: 5,
  },
  {
    name: "Zombie",
    health: 40,
    damage: 5,
    defense: 10,
  },
  {
    name: "Skeleton Archer",
    health: 10,
    damage: 20,
    defense: 0,
  }
]

const itemTypes = [
  "helm",
  "chest",
  "weapon",
  "shield",
  "amulet",
  "ring"
]

const items = {
  helm: [
    { name: "Hat", value: 1, type: "armor", weight: 100 },
    { name: "Cap", value: 2, type: "armor", weight: 80 },
    { name: "Crown", value: 5, type: "armor", weight: 70 },
    { name: "Leather Helm", value: 10, type: "armor", weight: 60 },
    { name: "Iron Helm", value: 15, type: "armor", weight: 40 },
    { name: "Steel Helm", value: 20, type: "armor", weight: 10 },
    { name: "Great Helm", value: 30, type: "armor", weight: 3 }
  ],
  chest: [
    { name: "Shirt", value: 1, type: "armor", weight: 100 },
    { name: "Padded Coat", value: 5, type: "armor", weight: 80 },
    { name: "Leather Coat", value: 10, type: "armor", weight: 60 },
    { name: "Chain Mail", value: 20, type: "armor", weight: 40 },
    { name: "Plate Mail", value: 35, type: "armor", weight: 10 },
    { name: "Full Plate Mail", value: 50, type: "armor", weight: 2 }
  ],
  weapon: [
    { name: "Club", value: 3, type: "damage", weight: 100 },
    { name: "Small Bow", value: 5, type: "damage", weight: 90 },
    { name: "Dagger", value: 7, type: "damage", weight: 80 },
    { name: "Long Bow", value: 10, type: "damage", weight: 70 },
    { name: "Sword", value: 10, type: "damage", weight: 60 },
    { name: "Great Bow", value: 15, type: "damage", weight: 50 },
    { name: "Mace", value: 15, type: "damage", weight: 40 },
    { name: "Axe", value: 20, type: "damage", weight: 20 },
    { name: "War Bow", value: 20, type: "damage", weight: 10 },
    { name: "Long Sword", value: 25, type: "damage", weight: 10 },
    { name: "Great Sword", value: 40, type: "damage", weight: 2 }
  ],
  shield: [
    { name: "Buckler", value: 3, type: "armor", weight: 100 },
    { name: "Small Shield", value: 5, type: "armor", weight: 80 },
    { name: "Tower Shield", value: 10, type: "armor", weight: 50 },
    { name: "Large Shield", value: 15, type: "armor", weight: 30 },
    { name: "Great Shield", value: 20, type: "armor", weight: 5 }
  ],
  amulet: [
    { name: "Amulet", value: "", type: "", weight: 50 },
  ],
  ring: [
    { name: "Ring", value: "", type: "", weight: 60 },
  ]
}

const prefixes = {
  helm: [
    { name: "Heavy", value: 150, type: "armor", weight: 70 },
    { name: "Light", value: 50, type: "armor", weight: 90 },
    { name: "Sturdy", value: 120, type: "armor", weight: 80 },
    { name: "Awesome", value: 200, type: "armor", weight: 20 }
  ],
  chest: [
    { name: "Heavy", value: 150, type: "armor", weight: 70 },
    { name: "Light", value: 50, type: "armor", weight: 90 },
    { name: "Sturdy", value: 120, type: "armor", weight: 80 },
    { name: "Awesome", value: 200, type: "armor", weight: 20 }
  ],
  weapon: [
    { name: "Heavy", value: 150, type: "damage", weight: 70 },
    { name: "Light", value: 50, type: "damage", weight: 90 },
    { name: "Sturdy", value: 120, type: "damage", weight: 80 },
    { name: "Awesome", value: 200, type: "damage", weight: 20 }
  ],
  shield: [
    { name: "Heavy", value: 150, type: "armor", weight: 70 },
    { name: "Light", value: 50, type: "armor", weight: 90 },
    { name: "Sturdy", value: 120, type: "armor", weight: 80 },
    { name: "Awesome", value: 200, type: "armor", weight: 20 }
  ],
  amulet: [
    { name: "Heavy", value: 150, type: "armor", weight: 70 },
    { name: "Light", value: 50, type: "armor", weight: 90 },
    { name: "Sturdy", value: 120, type: "armor", weight: 80 },
    { name: "Awesome", value: 200, type: "armor", weight: 20 }
  ],
  ring: [
    { name: "Heavy", value: 150, type: "armor", weight: 70 },
    { name: "Light", value: 50, type: "armor", weight: 90 },
    { name: "Sturdy", value: 120, type: "armor", weight: 80 },
    { name: "Awesome", value: 200, type: "armor", weight: 20 }
  ]
}

const suffixes = {
  helm: [
    { name: "Of Might", value: 15, type: "armor", weight: 70 },
    { name: "Of Weakness", value: -5, type: "armor", weight: 90 },
    { name: "Of Strength", value: 12, type: "armor", weight: 80 },
    { name: "Of Power", value: 20, type: "armor", weight: 20 }
  ],
  chest: [
    { name: "Of Might", value: 15, type: "armor", weight: 70 },
    { name: "Of Weakness", value: -5, type: "armor", weight: 90 },
    { name: "Of Strength", value: 12, type: "armor", weight: 80 },
    { name: "Of Power", value: 20, type: "armor", weight: 20 }
  ],
  weapon: [
    { name: "Of Might", value: 15, type: "damage", weight: 70 },
    { name: "Of Weakness", value: -5, type: "damage", weight: 90 },
    { name: "Of Strength", value: 12, type: "damage", weight: 80 },
    { name: "Of Power", value: 20, type: "damage", weight: 20 }
  ],
  shield: [
    { name: "Of Might", value: 15, type: "armor", weight: 70 },
    { name: "Of Weakness", value: -5, type: "armor", weight: 90 },
    { name: "Of Strength", value: 12, type: "armor", weight: 80 },
    { name: "Of Power", value: 20, type: "armor", weight: 20 }
  ],
  amulet: [
    { name: "Of Might", value: 15, type: "armor", weight: 70 },
    { name: "Of Weakness", value: -5, type: "armor", weight: 90 },
    { name: "Of Strength", value: 12, type: "armor", weight: 80 },
    { name: "Of Power", value: 20, type: "armor", weight: 20 }
  ],
  ring: [
    { name: "Of Might", value: 15, type: "armor", weight: 70 },
    { name: "Of Weakness", value: -5, type: "armor", weight: 90 },
    { name: "Of Strength", value: 12, type: "armor", weight: 80 },
    { name: "Of Power", value: 20, type: "armor", weight: 20 }
  ]
}

function generateItem(type) {
  // Choose random item within that type
  const item = items[type][Math.floor(Math.random() * items[type].length)];

  // Choose random prefix and suffix (if applicable)
  let prefix = {
    name: "",
    type: "",
    value: ""
  };
  let suffix = {
    name: "",
    type: "",
    value: ""
  }
  if (Math.random() < 0.5) {
    if (prefixes[type]) {
      prefix = prefixes[type][Math.floor(Math.random() * prefixes[type].length)];
    }
  }
  if (Math.random() < 0.5) {
    if (suffixes[type]) {
      suffix = suffixes[type][Math.floor(Math.random() * suffixes[type].length)];
    }
  }

  let generatedItem = {
    name: item.name,
    type: item.type,
    value: item.value,
    prefixname: prefix.name,
    prefixtype: prefix.type,
    prefixvalue: prefix.value,
    suffixname: suffix.name,
    suffixtype: suffix.type,
    suffixvalue: suffix.value
  }
  // Return generated item
  return generatedItem;
}

/* Randomly select an object from an array */
function pickRandomObject(objects) {
  // Check if there are any objects in the list
  if (!objects || objects.length === 0) { return null; }
  // Generate a random index between 0 and the length of the objects array
  const randomIndex = Math.floor(Math.random() * objects.length);
  // Return the object at the random index
  return objects[randomIndex];
}

function swapItem() {
  switch (newItemType) {
    case "helm":
      playerInventory.helm.name = playerInventory.newItem.name;
      playerInventory.helm.type = playerInventory.newItem.type;
      playerInventory.helm.value = playerInventory.newItem.value;
      playerInventory.helm.prefixname = playerInventory.newItem.prefixname;
      playerInventory.helm.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.helm.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.helm.suffixname = playerInventory.newItem.suffixname;
      playerInventory.helm.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.helm.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
    case "chest":
      playerInventory.chest.name = playerInventory.newItem.name;
      playerInventory.chest.type = playerInventory.newItem.type;
      playerInventory.chest.value = playerInventory.newItem.value;
      playerInventory.chest.prefixname = playerInventory.newItem.prefixname;
      playerInventory.chest.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.chest.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.chest.suffixname = playerInventory.newItem.suffixname;
      playerInventory.chest.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.chest.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
    case "weapon":
      playerInventory.weapon.name = playerInventory.newItem.name;
      playerInventory.weapon.type = playerInventory.newItem.type;
      playerInventory.weapon.value = playerInventory.newItem.value;
      playerInventory.weapon.prefixname = playerInventory.newItem.prefixname;
      playerInventory.weapon.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.weapon.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.weapon.suffixname = playerInventory.newItem.suffixname;
      playerInventory.weapon.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.weapon.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
    case "shield":
      playerInventory.shield.name = playerInventory.newItem.name;
      playerInventory.shield.type = playerInventory.newItem.type;
      playerInventory.shield.value = playerInventory.newItem.value;
      playerInventory.shield.prefixname = playerInventory.newItem.prefixname;
      playerInventory.shield.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.shield.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.shield.suffixname = playerInventory.newItem.suffixname;
      playerInventory.shield.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.shield.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
    case "amulet":
      playerInventory.amulet.name = playerInventory.newItem.name;
      playerInventory.amulet.prefixname = playerInventory.newItem.prefixname;
      playerInventory.amulet.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.amulet.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.amulet.suffixname = playerInventory.newItem.suffixname;
      playerInventory.amulet.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.amulet.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
    case "ring":
      playerInventory.ring.name = playerInventory.newItem.name;
      playerInventory.ring.prefixname = playerInventory.newItem.prefixname;
      playerInventory.ring.prefixtype = playerInventory.newItem.prefixtype;
      playerInventory.ring.prefixvalue = playerInventory.newItem.prefixvalue;
      playerInventory.ring.suffixname = playerInventory.newItem.suffixname;
      playerInventory.ring.suffixtype = playerInventory.newItem.suffixtype;
      playerInventory.ring.suffixvalue = playerInventory.newItem.suffixvalue;
      break;
  }
  playerInventory.newItem = null;
  newItemType = null;
  updateGameDisplay();
}
function discardItem() {
  playerInventory.newItem = null;
  newItemType = null;
  updateGameDisplay();
}

/* Spawn a new enemy */
function spawnNewEnemy() {
  if (currentEnemy) return; // Only spawn if no current enemy
  randomEnemy = pickRandomObject(enemies)
  currentEnemy = {
    name: randomEnemy.name,
    health: randomEnemy.health,
    damage: randomEnemy.damage,
    defense: randomEnemy.defense,
  };
  enemyAttackDamage = currentEnemy.damage / 4;
  updateGameDisplay();
}

/* Disable Attack Button */
function disableAttackButton() {
  const atkButton = document.getElementById("attackButton");
  atkButton.disabled = true;
  const newEnemyButton = document.getElementById("newEnemyButton");
  newEnemyButton.disabled = false;
}

/* Enable Attack Button */
function enableAttackButton() {
  const atkButton = document.getElementById("attackButton");
  atkButton.disabled = false;
  const newEnemyButton = document.getElementById("newEnemyButton");
  newEnemyButton.disabled = true;
}

/* Disable Stat Buttons */
function disableStatButtons() {
  const strButton = document.getElementById("strengthButton");
  strButton.disabled = true;
  const dexButton = document.getElementById("dexterityButton");
  dexButton.disabled = true;
  const magButton = document.getElementById("magicButton");
  magButton.disabled = true;
  const vitButton = document.getElementById("vitalityButton");
  vitButton.disabled = true;
}

/* Enable Stat Buttons */
function enableStatButtons() {
  const strButton = document.getElementById("strengthButton");
  strButton.disabled = false;
  const dexButton = document.getElementById("dexterityButton");
  dexButton.disabled = false;
  const magButton = document.getElementById("magicButton");
  magButton.disabled = false;
  const vitButton = document.getElementById("vitalityButton");
  vitButton.disabled = false;
}

/* Display and refresh function */
function updateGameDisplay() {
  /* Display game information */
  let hpContainer = document.getElementById("hp");
  hpContainer.innerHTML = `HP: ${Math.trunc(player.health.value)}/${Math.trunc(player.maxHealth.value)}`;
  let mpContainer = document.getElementById("mp");
  mpContainer.innerHTML = `MP: ${Math.trunc(player.mana.value)}/${Math.trunc(player.maxMana.value)}`;
  let levelContainer = document.getElementById("level");
  levelContainer.innerHTML = `Level: ${player.level.value}`;
  let xpContainer = document.getElementById("xp");
  xpContainer.innerHTML = `XP: ${Math.trunc(player.experience.value)}/${Math.trunc(experienceToLevelUp)}`;
  let gameContainer = document.getElementById("game-container");
  if (playerInventory.newItem) {
    gameContainer.innerHTML = `
        New item!<p />
        ${playerInventory.newItem.prefixname} ${playerInventory.newItem.prefixvalue} ${playerInventory.newItem.prefixtype}<br />
        ${playerInventory.newItem.name} ${playerInventory.newItem.value} ${playerInventory.newItem.type}<br />
        ${playerInventory.newItem.suffixname} ${playerInventory.newItem.suffixvalue} ${playerInventory.newItem.suffixtype}<p />
        <button id="swapItemButton" class="button-green" onclick="swapItem()">Take Item</button>
        <button id="discardItemButton" class="button-red" onclick="discardItem()">Discard Item</button><p />
        <button id="attackButton" class="button-darkblue" onclick="attackEnemy()">Attack</button>
        <button class="button-green" onclick="healPlayer()">Heal</button>
        <p /><button class="button-darkred" id="newEnemyButton" onclick="spawnNewEnemy()">New Enemy</button> <br />
        <br />
        `;
  } else {
    gameContainer.innerHTML = `
    <button id="attackButton" class="button-darkblue" onclick="attackEnemy()">Attack</button>
    <button class="button-green" onclick="healPlayer()">Heal</button>
    <p /><button class="button-darkred" id="newEnemyButton" onclick="spawnNewEnemy()">New Enemy</button> <br />
    <br />
  `;
  }
  if (currentEnemy) {
    enableAttackButton()
    gameContainer.innerHTML += `
      <span class="top"><br />${currentEnemy.name}
      <br />HP: ${currentEnemy.health} <br /></span>
    `;
  }
  if (!currentEnemy) {
    disableAttackButton()
  }

  /* Display character sheet information */
  let statsContainer = document.getElementById("stats-container");
  statsContainer.innerHTML = `
      STR: ${Math.trunc(player.strength.value)}&nbsp
      <button id="strengthButton" onclick="addStat('strength')">+1</button><p />
      DEX: ${Math.trunc(player.dexterity.value)}&nbsp
      <button id="dexterityButton" onclick="addStat('dexterity')">+1</button><p />
      MAG: ${Math.trunc(player.magic.value)}&nbsp
      <button id="magicButton" onclick="addStat('magic')">+1</button><p />
      VIT: ${Math.trunc(player.vitality.value)}&nbsp
      <button id="vitalityButton" onclick="addStat('vitality')">+1</button><p />
      Available Stats: ${pointsToAdd} <p />
  `;
  let levelupContainer = document.getElementById("levelup");
  if (pointsToAdd > 0) {
    enableStatButtons();
    levelContainer.innerHTML += ` - Stats: ${pointsToAdd}`;
  }
  if (pointsToAdd <= 0) {
    disableStatButtons();
    levelContainer.innerHTML += ``;
  }
  /* Display inventory information */
  let inventoryContainer = document.getElementById("inventory-container");
  inventoryContainer.innerHTML = `
    <span class="box">${playerInventory.helm.prefixname} ${playerInventory.helm.prefixvalue} ${playerInventory.helm.prefixtype}<br />
    ${playerInventory.helm.name} ${playerInventory.helm.value} ${playerInventory.helm.type}<br />
    ${playerInventory.helm.suffixname} ${playerInventory.helm.suffixvalue} ${playerInventory.helm.suffixtype}<br /></span>
    <span class="box">${playerInventory.chest.prefixname} ${playerInventory.chest.prefixvalue} ${playerInventory.chest.prefixtype}<br />
    ${playerInventory.chest.name} ${playerInventory.chest.value} ${playerInventory.chest.type}<br />
    ${playerInventory.chest.suffixname} ${playerInventory.chest.suffixvalue} ${playerInventory.chest.suffixtype}<br /></span>
    <span class="box">${playerInventory.weapon.prefixname} ${playerInventory.weapon.prefixvalue} ${playerInventory.weapon.prefixtype}<br />
    ${playerInventory.weapon.name} ${playerInventory.weapon.value} ${playerInventory.weapon.type}<br />
    ${playerInventory.weapon.suffixname} ${playerInventory.weapon.suffixvalue} ${playerInventory.weapon.suffixtype}<br /></span>
    <span class="box">${playerInventory.shield.prefixname} ${playerInventory.shield.prefixvalue} ${playerInventory.shield.prefixtype}<br />
    ${playerInventory.shield.name} ${playerInventory.shield.value} ${playerInventory.shield.type}<br />
    ${playerInventory.shield.suffixname} ${playerInventory.shield.suffixvalue} ${playerInventory.shield.suffixtype}<br /></span>
    <span class="box">${playerInventory.amulet.prefixname} ${playerInventory.amulet.prefixvalue} ${playerInventory.amulet.prefixtype}<br />
    ${playerInventory.amulet.name}<br />
    ${playerInventory.amulet.suffixname} ${playerInventory.amulet.suffixvalue} ${playerInventory.amulet.suffixtype}<br /></span>
    <span class="box">${playerInventory.ring.prefixname} ${playerInventory.ring.prefixvalue} ${playerInventory.ring.prefixtype}<br />
    ${playerInventory.ring.name}<br />
    ${playerInventory.ring.suffixname} ${playerInventory.ring.suffixvalue} ${playerInventory.ring.suffixtype}<br /></span>
    `;
}

/* Add stat points */
function addStat(statName) {
  if (pointsToAdd > 0) {
    player[statName].value++;
    pointsToAdd--;
    recalculatePoints();
    updateGameDisplay();
  }
}

/* Enemy attack player */
function enemyAttack() {
  if (Math.random() < 0.5) {
    player.health.value -= Math.floor(Math.random() * enemyAttackDamage + 1);
    player.health.value = Math.max(0, player.health.value);
    if (player.health.value <= 0) {
      alert("Dead");
      currentEnemy = null;
      player.health.value = player.maxHealth.value;
      player.mana.value = player.maxMana.value;
    }

    updateGameDisplay();
  }
}

/* Enemy turn */
function enemyTurn() {
  if (currentEnemy) {
    enemyAttack();
  }
}

/* Player attack enemy */
function playerAttack() {
  if (Math.random() > 0.5) {
    currentEnemy.health -= Math.floor(Math.random() * player.attack.value + 1); // Random damage based on player attack
    // Check for defeat
    if (currentEnemy.health <= 0) {
      currentEnemy = null;
      gainExperience(100); // Adjust experience gain
      newItemType = pickRandomObject(itemTypes); // Pick random item type
      playerInventory.newItem = generateItem(newItemType); // Generate new item
    }
  }
}

/* Attack button pushed function */
function attackEnemy() {
  if (!currentEnemy) return; // Prevent attacking if no enemy
  playerAttack();  // Player attack
  enemyTurn();
  updateGameDisplay();
}

/* Heal button pushed function */
function healPlayer() {
  if (player.mana.value >= healManaCost) {
    player.mana.value -= healManaCost;
    player.health.value += player.magic.value / 2; // Adjust healing amount
    player.health.value = Math.min(player.health.value, player.maxHealth.value);
    enemyTurn();
    updateGameDisplay();
  }
}

/* Gain experience and level up if needed */
function gainExperience(amount) {
  player.experience.value += amount;
  if (player.experience.value >= experienceToLevelUp && player.level.value < player.maxLevel.value) {
    player.level.value++;
    pointsToAdd += 5;
    player.experience.value -= experienceToLevelUp;
    experienceToLevelUp *= 1.18; // Gradually increase experience needed for next level
    // Optionally, increase player stats like health or attack based on level
    player.health.value = player.maxHealth.value;
    player.mana.value = player.maxMana.value;
  }
  updateGameDisplay();
}

/* Start game */
updateGameDisplay();