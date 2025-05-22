// ポケモンデータ
const pokemonData = {
  charmander: {
    name: "ヒトカゲ",
    type: "fire",
    baseHP: 39,
    baseAttack: 52,
    baseDefense: 43,
    baseSpeed: 65,
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png",
    moves: ["ひっかく", "ひのこ", "えんまく", "なきごえ"],
  },
  bulbasaur: {
    name: "フシギダネ",
    type: "grass",
    baseHP: 45,
    baseAttack: 49,
    baseDefense: 49,
    baseSpeed: 45,
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png",
    moves: ["たいあたり", "つるのムチ", "なきごえ", "やどりぎのタネ"],
  },
  squirtle: {
    name: "ゼニガメ",
    type: "water",
    baseHP: 44,
    baseAttack: 48,
    baseDefense: 65,
    baseSpeed: 43,
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/7.png",
    moves: ["たいあたり", "みずでっぽう", "しっぽをふる", "まもる"],
  },
  pikachu: {
    name: "ピカチュウ",
    type: "electric",
    baseHP: 35,
    baseAttack: 55,
    baseDefense: 40,
    baseSpeed: 90,
    sprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    backSprite:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png",
    moves: ["でんきショック", "でんこうせっか", "なきごえ", "10まんボルト"],
  },
};

// わざデータ
const moveData = {
  ひっかく: { power: 40, accuracy: 100, type: "normal", category: "physical" },
  ひのこ: { power: 40, accuracy: 100, type: "fire", category: "special" },
  えんまく: {
    power: 0,
    accuracy: 100,
    type: "normal",
    category: "status",
    effect: "lowerAccuracy",
  },
  なきごえ: {
    power: 0,
    accuracy: 100,
    type: "normal",
    category: "status",
    effect: "lowerAttack",
  },
  たいあたり: {
    power: 40,
    accuracy: 100,
    type: "normal",
    category: "physical",
  },
  つるのムチ: { power: 45, accuracy: 100, type: "grass", category: "physical" },
  やどりぎのタネ: {
    power: 0,
    accuracy: 90,
    type: "grass",
    category: "status",
    effect: "leechSeed",
  },
  みずでっぽう: {
    power: 40,
    accuracy: 100,
    type: "water",
    category: "special",
  },
  しっぽをふる: {
    power: 0,
    accuracy: 100,
    type: "normal",
    category: "status",
    effect: "lowerDefense",
  },
  まもる: {
    power: 0,
    accuracy: 100,
    type: "normal",
    category: "status",
    effect: "protect",
  },
  でんきショック: {
    power: 40,
    accuracy: 100,
    type: "electric",
    category: "special",
  },
  でんこうせっか: {
    power: 40,
    accuracy: 100,
    type: "normal",
    category: "physical",
    priority: 1,
  },
  "10まんボルト": {
    power: 90,
    accuracy: 100,
    type: "electric",
    category: "special",
  },
};

// タイプ相性
const typeChart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
};

// ゲームの状態
let gameState = {
  player: null,
  opponent: null,
  currentTurn: "player",
  battleActive: true,
  messageQueue: [],
  isProcessing: false,
};

// ポケモンクラス
class Pokemon {
  constructor(data, level = 5) {
    this.name = data.name;
    this.type = data.type;
    this.level = level;
    this.moves = data.moves;
    this.sprite = data.sprite;
    this.backSprite = data.backSprite;

    // ステータス計算
    this.maxHP = Math.floor((data.baseHP * 2 * level) / 100) + level + 10;
    this.currentHP = this.maxHP;
    this.attack = Math.floor((data.baseAttack * 2 * level) / 100) + 5;
    this.defense = Math.floor((data.baseDefense * 2 * level) / 100) + 5;
    this.speed = Math.floor((data.baseSpeed * 2 * level) / 100) + 5;

    // 状態異常
    this.status = null;
    this.statModifiers = {
      attack: 0,
      defense: 0,
      accuracy: 0,
    };
  }

  takeDamage(damage) {
    this.currentHP = Math.max(0, this.currentHP - damage);
    updateHPBar(this);
  }

  heal(amount) {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    updateHPBar(this);
  }

  isFainted() {
    return this.currentHP <= 0;
  }
}

// UI要素の取得
const elements = {
  messageBox: document.getElementById("message-box"),
  messageText: document.getElementById("message-text"),
  actionMenu: document.getElementById("action-menu"),
  moveMenu: document.getElementById("move-menu"),
  fightBtn: document.getElementById("fight-btn"),
  pokemonBtn: document.getElementById("pokemon-btn"),
  bagBtn: document.getElementById("bag-btn"),
  runBtn: document.getElementById("run-btn"),
  backBtn: document.getElementById("back-btn"),
  playerSprite: document.getElementById("player-sprite"),
  opponentSprite: document.getElementById("opponent-sprite"),
  playerName: document.getElementById("player-name"),
  opponentName: document.getElementById("opponent-name"),
  playerLevel: document.getElementById("player-level"),
  opponentLevel: document.getElementById("opponent-level"),
  playerHPBar: document.getElementById("player-hp-bar"),
  opponentHPBar: document.getElementById("opponent-hp-bar"),
  playerHPCurrent: document.getElementById("player-hp-current"),
  playerHPMax: document.getElementById("player-hp-max"),
  opponentHPCurrent: document.getElementById("opponent-hp-current"),
  opponentHPMax: document.getElementById("opponent-hp-max"),
};

// ゲーム初期化
function initGame() {
  // ランダムにポケモンを選択
  const pokemonKeys = Object.keys(pokemonData);
  const playerPokemonKey =
    pokemonKeys[Math.floor(Math.random() * pokemonKeys.length)];
  let opponentPokemonKey;
  do {
    opponentPokemonKey =
      pokemonKeys[Math.floor(Math.random() * pokemonKeys.length)];
  } while (opponentPokemonKey === playerPokemonKey);

  gameState.player = new Pokemon(
    pokemonData[playerPokemonKey],
    5 + Math.floor(Math.random() * 3)
  );
  gameState.opponent = new Pokemon(
    pokemonData[opponentPokemonKey],
    5 + Math.floor(Math.random() * 3)
  );

  // UI更新
  updatePokemonDisplay();
  showMessage(`野生の${gameState.opponent.name}が現れた！`);

  // イベントリスナー設定
  setupEventListeners();
}

// ポケモン表示の更新
function updatePokemonDisplay() {
  // プレイヤー
  elements.playerSprite.src = gameState.player.backSprite;
  elements.playerName.textContent = gameState.player.name;
  elements.playerLevel.textContent = gameState.player.level;
  elements.playerHPMax.textContent = gameState.player.maxHP;
  elements.playerHPCurrent.textContent = gameState.player.currentHP;

  // 相手
  elements.opponentSprite.src = gameState.opponent.sprite;
  elements.opponentName.textContent = gameState.opponent.name;
  elements.opponentLevel.textContent = gameState.opponent.level;
  elements.opponentHPMax.textContent = gameState.opponent.maxHP;
  elements.opponentHPCurrent.textContent = gameState.opponent.currentHP;

  updateHPBar(gameState.player);
  updateHPBar(gameState.opponent);
}

// HPバーの更新
function updateHPBar(pokemon) {
  const isPlayer = pokemon === gameState.player;
  const hpBar = isPlayer ? elements.playerHPBar : elements.opponentHPBar;
  const hpCurrent = isPlayer
    ? elements.playerHPCurrent
    : elements.opponentHPCurrent;

  const hpPercentage = (pokemon.currentHP / pokemon.maxHP) * 100;
  hpBar.style.width = hpPercentage + "%";
  hpCurrent.textContent = pokemon.currentHP;

  // HPに応じて色を変更
  if (hpPercentage > 50) {
    hpBar.style.backgroundColor = "#4CAF50";
  } else if (hpPercentage > 20) {
    hpBar.style.backgroundColor = "#FFC107";
  } else {
    hpBar.style.backgroundColor = "#F44336";
  }
}

// メッセージ表示
function showMessage(message, callback) {
  gameState.messageQueue.push({ message, callback });
  if (!gameState.isProcessing) {
    processMessageQueue();
  }
}

function processMessageQueue() {
  if (gameState.messageQueue.length === 0) {
    gameState.isProcessing = false;
    return;
  }

  gameState.isProcessing = true;
  const { message, callback } = gameState.messageQueue.shift();

  elements.messageText.textContent = message;

  setTimeout(() => {
    if (callback) callback();
    processMessageQueue();
  }, 1500);
}

// イベントリスナーの設定
function setupEventListeners() {
  elements.fightBtn.addEventListener("click", showMoveMenu);
  elements.pokemonBtn.addEventListener("click", () =>
    showMessage("手持ちのポケモンがいません！")
  );
  elements.bagBtn.addEventListener("click", () =>
    showMessage("バッグは空です！")
  );
  elements.runBtn.addEventListener("click", tryToRun);
  elements.backBtn.addEventListener("click", showActionMenu);

  // 技ボタンの設定
  for (let i = 0; i < 4; i++) {
    const moveBtn = document.getElementById(`move-${i + 1}`);
    moveBtn.addEventListener("click", () => useMove(i));
  }
}

// 技メニュー表示
function showMoveMenu() {
  elements.actionMenu.style.display = "none";
  elements.moveMenu.style.display = "flex";

  // 技ボタンの更新
  for (let i = 0; i < 4; i++) {
    const moveBtn = document.getElementById(`move-${i + 1}`);
    const moveName = gameState.player.moves[i];
    if (moveName) {
      moveBtn.textContent = moveName;
      moveBtn.disabled = false;
    } else {
      moveBtn.textContent = "-";
      moveBtn.disabled = true;
    }
  }
}

// アクションメニュー表示
function showActionMenu() {
  elements.moveMenu.style.display = "none";
  elements.actionMenu.style.display = "flex";
}

// 技を使用
function useMove(moveIndex) {
  const moveName = gameState.player.moves[moveIndex];
  if (!moveName) return;

  showActionMenu();
  disableButtons();

  // プレイヤーのターン
  const playerMove = moveName;
  const opponentMove =
    gameState.opponent.moves[
      Math.floor(Math.random() * gameState.opponent.moves.length)
    ];

  // 素早さで先攻を決定
  const playerFirst = gameState.player.speed >= gameState.opponent.speed;

  if (playerFirst) {
    executeTurn(gameState.player, gameState.opponent, playerMove, () => {
      if (!gameState.opponent.isFainted()) {
        executeTurn(
          gameState.opponent,
          gameState.player,
          opponentMove,
          checkBattleEnd
        );
      } else {
        checkBattleEnd();
      }
    });
  } else {
    executeTurn(gameState.opponent, gameState.player, opponentMove, () => {
      if (!gameState.player.isFainted()) {
        executeTurn(
          gameState.player,
          gameState.opponent,
          playerMove,
          checkBattleEnd
        );
      } else {
        checkBattleEnd();
      }
    });
  }
}

// ターン実行
function executeTurn(attacker, defender, moveName, callback) {
  const move = moveData[moveName];
  const isPlayer = attacker === gameState.player;

  showMessage(`${attacker.name}の${moveName}！`, () => {
    if (move.category === "status") {
      // 補助技の処理
      handleStatusMove(attacker, defender, move);
      callback();
    } else {
      // ダメージ計算
      const damage = calculateDamage(attacker, defender, move);

      // アニメーション
      const spriteElement = isPlayer
        ? elements.opponentSprite
        : elements.playerSprite;
      spriteElement.parentElement.classList.add("shake");

      setTimeout(() => {
        spriteElement.parentElement.classList.remove("shake");
        defender.takeDamage(damage);

        if (damage > 0) {
          showMessage(`${damage}のダメージ！`, callback);
        } else {
          showMessage("効果がないようだ...", callback);
        }
      }, 500);
    }
  });
}

// ダメージ計算
function calculateDamage(attacker, defender, move) {
  if (move.power === 0) return 0;

  const level = attacker.level;
  const power = move.power;
  const attack =
    move.category === "physical" ? attacker.attack : attacker.attack;
  const defense =
    move.category === "physical" ? defender.defense : defender.defense;

  // タイプ相性
  let effectiveness = 1;
  if (typeChart[move.type] && typeChart[move.type][defender.type]) {
    effectiveness = typeChart[move.type][defender.type];
  }

  // 同タイプボーナス
  const stab = move.type === attacker.type ? 1.5 : 1;

  // 乱数
  const random = Math.random() * (1 - 0.85) + 0.85;

  // ダメージ計算式
  const damage = Math.floor(
    ((((2 * level) / 5 + 2) * power * attack) / defense / 50 + 2) *
      effectiveness *
      stab *
      random
  );

  return Math.max(1, damage);
}

// 補助技の処理
function handleStatusMove(attacker, defender, move) {
  switch (move.effect) {
    case "lowerAttack":
      defender.statModifiers.attack = Math.max(
        -6,
        defender.statModifiers.attack - 1
      );
      showMessage(`${defender.name}の攻撃が下がった！`);
      break;
    case "lowerDefense":
      defender.statModifiers.defense = Math.max(
        -6,
        defender.statModifiers.defense - 1
      );
      showMessage(`${defender.name}の防御が下がった！`);
      break;
    case "lowerAccuracy":
      defender.statModifiers.accuracy = Math.max(
        -6,
        defender.statModifiers.accuracy - 1
      );
      showMessage(`${defender.name}の命中率が下がった！`);
      break;
    case "leechSeed":
      defender.status = "seeded";
      showMessage(`${defender.name}にタネを植えつけた！`);
      break;
    case "protect":
      attacker.status = "protected";
      showMessage(`${attacker.name}は身を守っている！`);
      break;
  }
}

// バトル終了チェック
function checkBattleEnd() {
  if (gameState.player.isFainted()) {
    showMessage(`${gameState.player.name}は倒れた...`, () => {
      showMessage("目の前が真っ暗になった！", () => {
        resetGame();
      });
    });
  } else if (gameState.opponent.isFainted()) {
    // 経験値計算
    const expGained = Math.floor((gameState.opponent.level * 50) / 7);
    showMessage(`${gameState.opponent.name}は倒れた！`, () => {
      showMessage(`${expGained}の経験値を手に入れた！`, () => {
        showMessage("勝利！", () => {
          resetGame();
        });
      });
    });
  } else {
    enableButtons();
  }
}

// 逃げる
function tryToRun() {
  const escapeChance =
    (gameState.player.speed * 32) / (gameState.opponent.speed / 4) + 30;
  const random = Math.random() * 100;

  if (random < escapeChance) {
    showMessage("うまく逃げ切れた！", () => {
      resetGame();
    });
  } else {
    showMessage("逃げられない！", () => {
      // 相手のターン
      const opponentMove =
        gameState.opponent.moves[
          Math.floor(Math.random() * gameState.opponent.moves.length)
        ];
      executeTurn(
        gameState.opponent,
        gameState.player,
        opponentMove,
        checkBattleEnd
      );
    });
  }
}

// ボタンの有効/無効化
function disableButtons() {
  document.querySelectorAll(".menu-button, .move-button").forEach((btn) => {
    btn.disabled = true;
  });
}

function enableButtons() {
  document.querySelectorAll(".menu-button, .move-button").forEach((btn) => {
    btn.disabled = false;
  });
}

// ゲームリセット
function resetGame() {
  setTimeout(() => {
    location.reload();
  }, 2000);
}

// ゲーム開始
window.addEventListener("DOMContentLoaded", initGame);
