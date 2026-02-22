(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const VIEW_W = canvas.width;
  const VIEW_H = canvas.height;
  const HORIZON_Y = 130;
  const FLOOR_TOP = 170;
  const FLOOR_BOTTOM = 512;
  const ARENA = {
    minX: 120,
    maxX: 840,
    minZ: 0.08,
    maxZ: 0.96,
  };
  const GRAVITY = 1480;

  const backdropPeaks = Array.from({ length: 6 }, (_, i) => ({
    x: i * 170 - 50,
    height: 30 + (i * 19) % 30,
  }));

  const PIG_ARCHETYPES = {
    scout: {
      name: "Scout Pig",
      bodyColor: "#f4a7bd",
      snoutColor: "#ea7f9f",
      legColor: "#5c455a",
      hp: 3,
      radius: 18,
      hopMin: 0.46,
      hopMax: 0.88,
      jumpMin: 520,
      jumpMax: 700,
      runMin: 150,
      runMax: 280,
      runZMin: 0.45,
      runZMax: 0.9,
      driftX: 42,
      driftZ: 0.07,
      bounceDamp: 0.35,
      drag: 3.5,
      contactDamage: 1,
      knockback: 190,
      launch: 420,
      splatterScale: 1,
      score: 55,
    },
    pogo: {
      name: "Pogo Pig",
      bodyColor: "#ff9ec0",
      snoutColor: "#f27899",
      legColor: "#573a53",
      hp: 4,
      radius: 19,
      hopMin: 0.38,
      hopMax: 0.76,
      jumpMin: 650,
      jumpMax: 880,
      runMin: 140,
      runMax: 240,
      runZMin: 0.55,
      runZMax: 0.98,
      driftX: 34,
      driftZ: 0.08,
      bounceDamp: 0.4,
      drag: 3.2,
      contactDamage: 1,
      knockback: 210,
      launch: 470,
      splatterScale: 1.15,
      score: 70,
    },
    bruiser: {
      name: "Bruiser Pig",
      bodyColor: "#e996ad",
      snoutColor: "#dc6d8c",
      legColor: "#4f3b4c",
      hp: 6,
      radius: 22,
      hopMin: 0.62,
      hopMax: 1.15,
      jumpMin: 480,
      jumpMax: 670,
      runMin: 170,
      runMax: 300,
      runZMin: 0.38,
      runZMax: 0.8,
      driftX: 28,
      driftZ: 0.06,
      bounceDamp: 0.3,
      drag: 2.6,
      contactDamage: 1,
      knockback: 240,
      launch: 500,
      splatterScale: 1.35,
      score: 95,
    },
    tank: {
      name: "Tank Pig",
      bodyColor: "#d67f9e",
      snoutColor: "#c85f83",
      legColor: "#42313f",
      hp: 9,
      radius: 25,
      hopMin: 0.8,
      hopMax: 1.35,
      jumpMin: 420,
      jumpMax: 580,
      runMin: 130,
      runMax: 230,
      runZMin: 0.3,
      runZMax: 0.68,
      driftX: 22,
      driftZ: 0.045,
      bounceDamp: 0.22,
      drag: 2.2,
      contactDamage: 2,
      knockback: 280,
      launch: 540,
      splatterScale: 1.7,
      score: 145,
    },
    boss: {
      name: "Boss Hog Supreme",
      bodyColor: "#bf5b84",
      snoutColor: "#a63f66",
      legColor: "#2f2630",
      hp: 54,
      radius: 41,
      hopMin: 0.38,
      hopMax: 0.85,
      jumpMin: 640,
      jumpMax: 920,
      runMin: 170,
      runMax: 280,
      runZMin: 0.4,
      runZMax: 0.88,
      driftX: 18,
      driftZ: 0.03,
      bounceDamp: 0.45,
      drag: 1.7,
      contactDamage: 2,
      knockback: 330,
      launch: 610,
      splatterScale: 2.6,
      score: 1200,
    },
  };

  const MODES = {
    START: "start",
    PLAYING: "playing",
    UPGRADE: "upgrade",
    OVER: "over",
  };

  const CONTROL_SCHEMES = {
    KEYBOARD: "keyboard",
    TOUCH: "touch",
  };

  const INPUT_BINDINGS = {
    moveLeft: ["ArrowLeft", "KeyA"],
    moveRight: ["ArrowRight", "KeyD"],
    moveUp: ["ArrowUp", "KeyW"],
    moveDown: ["ArrowDown", "KeyS"],
    jump: ["Space"],
    fire: ["KeyX", "KeyJ", "ControlLeft"],
    fury: ["KeyC", "ShiftLeft", "ShiftRight"],
    start: ["Enter"],
    restart: ["KeyR", "Enter"],
    fullscreen: ["KeyF"],
  };

  const UI_THEME = {
    fonts: {
      tiny: "11px monospace",
      small: "12px monospace",
      body: "14px monospace",
      mid: "18px monospace",
      controls: "20px monospace",
      labelBold: "bold 16px monospace",
      popupBold: "bold 18px monospace",
      header: "bold 24px monospace",
      title: "bold 34px monospace",
      logo: "bold 44px monospace",
      score: "bold 26px monospace",
    },
    hud: {
      panelFill: "rgba(7, 13, 22, 0.82)",
      panelStroke: "rgba(145, 196, 255, 0.7)",
      heading: "#97c8ff",
      text: "#c7def8",
      score: "#f4fbff",
      caution: "#ff8a8a",
      comboFill: "rgba(255, 168, 28, 0.9)",
      comboText: "#1b1200",
      comboIdleFill: "rgba(85, 100, 122, 0.72)",
      comboIdleText: "#dce5f2",
      multFill: "rgba(35, 54, 96, 0.9)",
      multText: "#ffe37b",
      hpBg: "#1a2d44",
      hpFill: "#ff4b4b",
      hpStroke: "#9dc5ff",
      hpLabel: "#dcefff",
      furyBg: "rgba(20, 35, 20, 0.88)",
      furyFill: "#56ca47",
      furyFillReady: "#9eff68",
      furyFillActive: "#98ff62",
      furyStroke: "#d9ffbe",
      furyLabel: "#dff5ce",
      dryStroke: "#ffc3c3",
      dryText: "#fff0f0",
    },
    overlays: {
      bannerFill: "rgba(8, 10, 14, 0.76)",
      bannerStroke: "#ffd95c",
      bannerText: "#ffd95c",
      bannerFuryText: "#90ff7c",
      vignetteEdge: "rgba(56, 109, 35, 0.32)",
    },
    menu: {
      panelFill: "rgba(4, 8, 16, 0.7)",
      panelStroke: "#88beff",
      headerFill: "rgba(24, 46, 78, 0.76)",
      logo: "#ffffff",
      subtitle: "#b8e1ff",
      section: "#92c6ff",
      text: "#e9f6ff",
      ctaFill: "rgba(22, 38, 18, 0.86)",
      ctaStroke: "#bff39f",
      ctaText: "#dbffbe",
    },
    upgrade: {
      panelFill: "rgba(5, 11, 18, 0.8)",
      panelStroke: "#b7ff9a",
      title: "#e8ffd8",
      subtitle: "#d8edff",
      cardFill: "rgba(19, 36, 24, 0.9)",
      cardStroke: "#9be67e",
      cardIndex: "#9be67e",
      cardTitle: "#f4ffe9",
      cardBody: "#d2e6f9",
      footer: "#f8ffcf",
    },
  };

  const TOUCH_UI = {
    startButton: { x: 632, y: 492, w: 304, h: 34 },
    furyBarHit: { x: 198, y: 98, w: 146, h: 26 },
    upgradeCardStartX: 164,
    upgradeCardY: 210,
    upgradeCardW: 198,
    upgradeCardH: 176,
    upgradeCardGap: 218,
  };

  const keysDown = new Set();

  const state = {
    mode: MODES.START,
    controlScheme: CONTROL_SCHEMES.KEYBOARD,
    time: 0,
    level: 1,
    levelKillCount: 0,
    score: 0,
    killCount: 0,
    combo: 0,
    comboTimer: 0,
    comboMult: 1,
    shake: 0,
    hitStop: 0,
    spawnTimer: 1.7,
    carrotTimer: 5.2,
    maxPigs: 4,
    bossThreshold: 22,
    pigSpeedMult: 1,
    pigAggroMult: 1,
    eliteChance: 0,
    bossPhaseThresholds: [0.75, 0.5, 0.25],
    bossSpawned: false,
    bossDefeated: false,
    bossBannerTimer: 0,
    bossBannerText: "BOSS HOG ENTERS",
    furyMeter: 0,
    furyMax: 100,
    furyActive: false,
    furyTimer: 0,
    furyBannerTimer: 0,
    furyBannerText: "FURY READY (C)",
    upgradeChoices: [],
    upgradePicks: 0,
    upgradeHistory: {},
    meleeCarrotCooldown: 0,
    nextPigId: 1,
    nextExplosionId: 1,
    explosionStats: {},
    player: {},
    pigs: [],
    carrots: [],
    grenades: [],
    explosions: [],
    splatters: [],
    popups: [],
    splatterPool: [],
    explosionPool: [],
    popupPool: [],
    touch: {
      active: false,
      pointerId: null,
      mouseSim: false,
      x: VIEW_W * 0.5,
      y: VIEW_H * 0.72,
      autoFireTimer: 0,
      autoFireInterval: 0.17,
    },
  };

  const ELITE_TRAITS = [
    {
      id: "blitz",
      name: "Blitz",
      color: "#a6ff78",
      apply(pig) {
        pig.runMin *= 1.28;
        pig.runMax *= 1.34;
        pig.hopMin *= 0.72;
        pig.hopMax *= 0.78;
        pig.scoreValue = Math.round(pig.scoreValue * 1.35);
      },
    },
    {
      id: "armored",
      name: "Armored",
      color: "#ffd47d",
      apply(pig) {
        pig.hp = Math.round(pig.hp * 1.75) + 1;
        pig.maxHp = pig.hp;
        pig.contactDamage += 1;
        pig.drag *= 0.9;
        pig.scoreValue = Math.round(pig.scoreValue * 1.5);
      },
    },
    {
      id: "rabid",
      name: "Rabid",
      color: "#ff9d7f",
      apply(pig) {
        pig.contactDamage += 1;
        pig.knockback *= 1.16;
        pig.jumpMin *= 1.08;
        pig.jumpMax *= 1.12;
        pig.scoreValue = Math.round(pig.scoreValue * 1.42);
      },
    },
    {
      id: "stalker",
      name: "Stalker",
      color: "#c9adff",
      apply(pig) {
        pig.driftX *= 0.45;
        pig.driftZ *= 0.55;
        pig.hopMin *= 0.8;
        pig.hopMax *= 0.86;
        pig.runZMin *= 1.08;
        pig.runZMax *= 1.12;
        pig.scoreValue = Math.round(pig.scoreValue * 1.4);
      },
    },
    {
      id: "volatile",
      name: "Volatile",
      color: "#9af0ff",
      apply(pig) {
        pig.deathExplosion = true;
        pig.splatterScale *= 1.2;
        pig.scoreValue = Math.round(pig.scoreValue * 1.55);
      },
    },
  ];

  const UPGRADE_POOL = [
    {
      id: "blast_mix",
      label: "Blast Mix",
      desc: "+20% grenade damage, +12% blast radius",
      apply() {
        state.player.grenadeDamageMult *= 1.2;
        state.player.grenadeRadiusMult *= 1.12;
      },
    },
    {
      id: "bandolier",
      label: "Bandolier",
      desc: "+4 max ammo and +6 ammo now",
      apply() {
        state.player.maxAmmo += 4;
        state.player.ammo = Math.min(state.player.maxAmmo, state.player.ammo + 6);
      },
    },
    {
      id: "steel_hide",
      label: "Steel Hide",
      desc: "+1 max health and heal 2",
      apply() {
        state.player.maxHealth += 1;
        state.player.health = Math.min(state.player.maxHealth, state.player.health + 2);
      },
    },
    {
      id: "rocket_boots",
      label: "Rocket Boots",
      desc: "+12% move speed and stronger bunny hop",
      apply() {
        state.player.speedX *= 1.12;
        state.player.speedZ *= 1.12;
        state.player.jump *= 1.07;
      },
    },
    {
      id: "fury_core",
      label: "Fury Core",
      desc: "+30% Fury gain",
      apply() {
        state.player.furyGainMult *= 1.3;
      },
    },
    {
      id: "machete_edge",
      label: "Machete Edge",
      desc: "+1 melee damage and +12% swipe range",
      apply() {
        state.player.meleeDamageBonus += 1;
        state.player.meleeRangeMult *= 1.12;
      },
    },
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function weightedChoice(entries) {
    let total = 0;
    for (const entry of entries) {
      total += entry.weight;
    }
    let roll = Math.random() * total;
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.type;
      }
    }
    return entries[entries.length - 1].type;
  }

  function keyMatches(action, code) {
    const keys = INPUT_BINDINGS[action];
    return !!keys && keys.indexOf(code) >= 0;
  }

  function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  function isTouchControls() {
    return state.controlScheme === CONTROL_SCHEMES.TOUCH;
  }

  function resetTouchPointer() {
    state.touch.active = false;
    state.touch.pointerId = null;
  }

  function setControlScheme(nextScheme) {
    state.controlScheme = nextScheme;
    if (nextScheme !== CONTROL_SCHEMES.TOUCH) {
      state.touch.mouseSim = false;
    }
    resetTouchPointer();
    state.touch.autoFireTimer = 0;
  }

  function pointInTouchStartButton(x, y) {
    return isPointInRect(x, y, TOUCH_UI.startButton);
  }

  function pointInFuryBar(x, y) {
    return isPointInRect(x, y, TOUCH_UI.furyBarHit);
  }

  function getUpgradeCardIndexAtPoint(x, y) {
    for (let i = 0; i < state.upgradeChoices.length; i += 1) {
      const rect = {
        x: TOUCH_UI.upgradeCardStartX + i * TOUCH_UI.upgradeCardGap,
        y: TOUCH_UI.upgradeCardY,
        w: TOUCH_UI.upgradeCardW,
        h: TOUCH_UI.upgradeCardH,
      };
      if (isPointInRect(x, y, rect)) {
        return i;
      }
    }
    return -1;
  }

  function anyDown(action) {
    const keys = INPUT_BINDINGS[action];
    if (!keys) {
      return false;
    }
    for (const code of keys) {
      if (keysDown.has(code)) {
        return true;
      }
    }
    return false;
  }

  function isActionPress(event, action) {
    return keyMatches(action, event.code) && !event.repeat;
  }

  /**
   * Centralized mode transitions to prevent stale key/input state leaks.
   */
  function transitionToMode(nextMode) {
    if (state.mode === nextMode) {
      return;
    }
    state.mode = nextMode;
    keysDown.clear();
    if (nextMode !== MODES.PLAYING) {
      resetTouchPointer();
    }
  }

  /**
   * Reuse effect objects instead of allocating every frame.
   */
  function acquirePooledObject(pool) {
    return pool.length > 0 ? pool.pop() : {};
  }

  function recycleAll(list, pool) {
    while (list.length > 0) {
      pool.push(list.pop());
    }
  }

  function recycleAt(list, index, pool) {
    const last = list.length - 1;
    if (index < 0 || index > last) {
      return;
    }
    if (index !== last) {
      list[index] = list[last];
    }
    const item = list.pop();
    pool.push(item);
  }

  function clearTransientCombatState(options = {}) {
    const keepPopups = !!options.keepPopups;
    state.grenades.length = 0;
    recycleAll(state.explosions, state.explosionPool);
    recycleAll(state.splatters, state.splatterPool);
    if (!keepPopups) {
      recycleAll(state.popups, state.popupPool);
    }
    state.explosionStats = {};
  }

  function buildBossPhaseThresholds(level) {
    const thresholdCount = 3 + Math.min(5, Math.floor((level - 1) / 2));
    if (thresholdCount <= 1) {
      return [0.45];
    }
    const start = 0.84;
    const end = 0.14;
    const step = (start - end) / (thresholdCount - 1);
    const thresholds = [];
    for (let i = 0; i < thresholdCount; i += 1) {
      thresholds.push(Number((start - step * i).toFixed(3)));
    }
    return thresholds;
  }

  function getLevelTuning(level) {
    const n = Math.max(1, level);
    return {
      maxPigs: Math.min(14, 4 + Math.floor((n - 1) * 1.5)),
      bossThreshold: 18 + Math.floor(n * 4),
      pigSpeedMult: Math.min(2.9, 1 + (n - 1) * 0.09),
      pigAggroMult: Math.min(2.4, 1 + (n - 1) * 0.07),
      eliteChance: Math.min(0.62, 0.08 + (n - 1) * 0.04),
      bossPhaseThresholds: buildBossPhaseThresholds(n),
    };
  }

  function configureLevel(level) {
    const tuning = getLevelTuning(level);
    state.level = level;
    state.levelKillCount = 0;
    state.maxPigs = tuning.maxPigs;
    state.bossThreshold = tuning.bossThreshold;
    state.pigSpeedMult = tuning.pigSpeedMult;
    state.pigAggroMult = tuning.pigAggroMult;
    state.eliteChance = tuning.eliteChance;
    state.bossPhaseThresholds = tuning.bossPhaseThresholds;
    state.bossSpawned = false;
    state.bossDefeated = false;
  }

  function generateUpgradeChoices(count = 3) {
    const pool = [...UPGRADE_POOL];
    const picks = [];
    while (picks.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picks;
  }

  function applyUpgradeChoice(choice) {
    if (!choice) {
      return;
    }
    choice.apply();
    state.upgradePicks += 1;
    state.upgradeHistory[choice.id] = (state.upgradeHistory[choice.id] || 0) + 1;
    state.score += 90 + state.level * 25;
    pushPopup(`UPGRADE: ${choice.label.toUpperCase()}`, state.player.x, state.player.z, "#9dff82", 1.5, 16);
  }

  function startThreatLevel(level, keepResources = true) {
    configureLevel(level);
    transitionToMode(MODES.PLAYING);
    state.spawnTimer = rand(0.8, 1.3);
    state.carrotTimer = rand(3.8, 6.1);
    state.bossBannerTimer = 2.4;
    state.bossBannerText = `THREAT LEVEL ${state.level}`;
    state.furyBannerTimer = 0;
    state.upgradeChoices = [];
    state.pigs.length = 0;
    state.carrots.length = 0;
    clearTransientCombatState({ keepPopups: true });
    resetTouchPointer();
    state.touch.autoFireTimer = 0;

    const p = state.player;
    p.vx = 0;
    p.vz = 0;
    p.vy = 0;
    p.height = 0;
    p.onGround = true;
    p.x = VIEW_W * 0.5;
    p.z = 0.84;
    p.invuln = 0.9;
    p.fireCooldown = 0;
    p.meleeStartup = 0;
    p.meleeActive = 0;
    p.meleeRecovery = 0;
    p.meleeTrail = 0;
    p.meleeFlash = 0;
    p.meleeHitIds = new Set();

    if (keepResources) {
      p.health = Math.min(p.maxHealth, p.health + 2);
      p.ammo = Math.min(p.maxAmmo, p.ammo + 6);
    }

    state.pigs.push(createPig(choosePigType(), rand(190, 310), rand(0.2, 0.7)));
    state.pigs.push(createPig(choosePigType(), rand(640, 760), rand(0.35, 0.88)));
  }

  function enterUpgradeDraft() {
    transitionToMode(MODES.UPGRADE);
    state.combo = 0;
    state.comboTimer = 0;
    state.comboMult = 1;
    state.furyActive = false;
    state.furyTimer = 0;
    clearTransientCombatState({ keepPopups: true });
    state.pigs.length = 0;
    state.upgradeChoices = generateUpgradeChoices(3);
    state.bossBannerTimer = 3;
    state.bossBannerText = `THREAT ${state.level} CLEARED`;
  }

  function pushPopup(text, x, z, color = "#ffd95c", ttl = 1, size = 16) {
    const popup = acquirePooledObject(state.popupPool);
    popup.text = text;
    popup.x = x;
    popup.z = z;
    popup.age = 0;
    popup.ttl = ttl;
    popup.rise = rand(26, 44);
    popup.size = size;
    popup.color = color;
    popup.wobble = rand(0, Math.PI * 2);
    state.popups.push(popup);
  }

  function triggerImpact(shake, freezeSeconds) {
    state.shake = Math.max(state.shake, shake);
    state.hitStop = Math.max(state.hitStop, freezeSeconds);
  }

  function addFury(amount) {
    if (state.furyActive) {
      return;
    }
    const furyAmount = amount * (state.player.furyGainMult || 1);
    const prev = state.furyMeter;
    state.furyMeter = clamp(state.furyMeter + furyAmount, 0, state.furyMax);
    if (prev < state.furyMax && state.furyMeter >= state.furyMax) {
      state.furyBannerTimer = Math.max(state.furyBannerTimer, 2.2);
      state.furyBannerText = "FURY READY (C)";
      pushPopup("FURY READY", state.player.x, state.player.z, "#83ff5f", 1.4, 18);
    }
  }

  function activateFury() {
    if (state.furyActive || state.furyMeter < state.furyMax || state.mode !== MODES.PLAYING) {
      return;
    }
    state.furyActive = true;
    state.furyTimer = 8;
    state.furyMeter = 0;
    state.furyBannerTimer = 2.6;
    state.furyBannerText = "CARROT FURY ACTIVE";
    state.bossBannerText = "CARROT FURY";
    pushPopup("CARROT FURY!", state.player.x, state.player.z, "#8dff66", 1.4, 20);
    triggerImpact(9, 0.05);
  }

  function projectToScreen(x, z, height = 0) {
    const depth = clamp(z, ARENA.minZ, ARENA.maxZ);
    const scale = 0.5 + depth * 0.86;
    const sx = VIEW_W * 0.5 + (x - VIEW_W * 0.5) * scale;
    const groundY = FLOOR_TOP + depth * (FLOOR_BOTTOM - FLOOR_TOP);
    const sy = groundY - height * scale;
    return { x: sx, y: sy, scale, groundY, depth };
  }

  function arenaDistance(a, b) {
    const dx = a.x - b.x;
    const dz = (a.z - b.z) * 760;
    return Math.hypot(dx, dz);
  }

  function normalize2(x, z, zWeight = 1) {
    const mag = Math.hypot(x, z * zWeight);
    if (mag < 0.0001) {
      return { x: 1, z: 0 };
    }
    return { x: x / mag, z: z / mag };
  }

  function resetPlayer() {
    state.player = {
      x: 480,
      z: 0.82,
      height: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      speedX: 340,
      speedZ: 0.72,
      jump: 620,
      facingX: 1,
      facingZ: 0,
      radius: 20,
      onGround: true,
      health: 8,
      maxHealth: 8,
      ammo: 5,
      maxAmmo: 24,
      grenadeDamageMult: 1,
      grenadeRadiusMult: 1,
      grenadeBounceBonus: 0,
      furyGainMult: 1,
      meleeDamageBonus: 0,
      meleeRangeMult: 1,
      invuln: 0,
      fireCooldown: 0,
      meleeStartup: 0,
      meleeActive: 0,
      meleeRecovery: 0,
      meleeTrail: 0,
      meleeFlash: 0,
      meleeHitIds: new Set(),
      carrotsEaten: 0,
    };
  }

  function countRegularPigs() {
    let count = 0;
    for (const pig of state.pigs) {
      if (!pig.isBoss) {
        count += 1;
      }
    }
    return count;
  }

  function getBossPig() {
    for (const pig of state.pigs) {
      if (pig.isBoss) {
        return pig;
      }
    }
    return null;
  }

  function choosePigType() {
    const danger = state.level + state.levelKillCount * 0.08;
    if (danger < 3) {
      return weightedChoice([
        { type: "scout", weight: 0.6 },
        { type: "pogo", weight: 0.32 },
        { type: "bruiser", weight: 0.08 },
      ]);
    }
    if (danger < 6) {
      return weightedChoice([
        { type: "scout", weight: 0.22 },
        { type: "pogo", weight: 0.34 },
        { type: "bruiser", weight: 0.3 },
        { type: "tank", weight: 0.14 },
      ]);
    }
    return weightedChoice([
      { type: "pogo", weight: 0.2 },
      { type: "bruiser", weight: 0.34 },
      { type: "tank", weight: 0.46 },
    ]);
  }

  function createPig(type, x, z) {
    const archetype = PIG_ARCHETYPES[type] || PIG_ARCHETYPES.scout;
    const pig = {
      id: state.nextPigId++,
      type,
      name: archetype.name,
      isBoss: type === "boss",
      x,
      z,
      height: 0,
      vx: rand(-40, 40),
      vz: rand(-0.08, 0.08),
      vy: 0,
      radius: archetype.radius,
      hp: archetype.hp,
      maxHp: archetype.hp,
      hopMin: archetype.hopMin,
      hopMax: archetype.hopMax,
      jumpMin: archetype.jumpMin,
      jumpMax: archetype.jumpMax,
      runMin: archetype.runMin,
      runMax: archetype.runMax,
      runZMin: archetype.runZMin,
      runZMax: archetype.runZMax,
      driftX: archetype.driftX,
      driftZ: archetype.driftZ,
      bounceDamp: archetype.bounceDamp,
      drag: archetype.drag,
      contactDamage: archetype.contactDamage,
      knockback: archetype.knockback,
      launch: archetype.launch,
      splatterScale: archetype.splatterScale,
      scoreValue: archetype.score,
      bodyColor: archetype.bodyColor,
      snoutColor: archetype.snoutColor,
      legColor: archetype.legColor,
      hopCooldown: rand(archetype.hopMin * 0.7, archetype.hopMax),
      hitFlash: 0,
      phase: type === "boss" ? 1 : 0,
      phaseIndex: 0,
      phaseThresholds: type === "boss" ? [...state.bossPhaseThresholds] : [],
      stompCooldown: 0,
      summonCooldown: rand(4, 6),
      eliteTrait: null,
      eliteColor: null,
      deathExplosion: false,
      lastDamageMeta: null,
    };

    const level = Math.max(1, state.level);
    const speedMult = state.pigSpeedMult || 1;
    const aggroMult = state.pigAggroMult || 1;

    if (pig.isBoss) {
      pig.hp = Math.round(pig.hp * (1 + (level - 1) * 0.4));
      pig.maxHp = pig.hp;
      pig.runMin *= speedMult * (1 + (level - 1) * 0.03);
      pig.runMax *= speedMult * (1 + (level - 1) * 0.035);
      pig.runZMin *= speedMult;
      pig.runZMax *= speedMult;
      pig.jumpMin *= 1 + (level - 1) * 0.06;
      pig.jumpMax *= 1 + (level - 1) * 0.07;
      pig.hopMin = Math.max(0.15, pig.hopMin / (aggroMult * 1.08));
      pig.hopMax = Math.max(pig.hopMin + 0.08, pig.hopMax / (aggroMult * 1.1));
      pig.contactDamage = Math.min(8, pig.contactDamage + Math.floor((level - 1) / 2));
      pig.scoreValue = Math.round(pig.scoreValue * (1 + (level - 1) * 0.35));
    } else {
      pig.hp = Math.round(pig.hp * (1 + (level - 1) * 0.12));
      pig.maxHp = pig.hp;
      pig.runMin *= speedMult;
      pig.runMax *= speedMult;
      pig.runZMin *= speedMult;
      pig.runZMax *= speedMult;
      pig.jumpMin *= 1 + (level - 1) * 0.04;
      pig.jumpMax *= 1 + (level - 1) * 0.045;
      pig.hopMin = Math.max(0.16, pig.hopMin / aggroMult);
      pig.hopMax = Math.max(pig.hopMin + 0.07, pig.hopMax / aggroMult);
      pig.contactDamage = Math.min(6, pig.contactDamage + Math.floor((level - 1) / 4));
      pig.scoreValue = Math.round(pig.scoreValue * (1 + (level - 1) * 0.18));
    }

    pig.runZMin = Math.min(2.5, pig.runZMin);
    pig.runZMax = Math.min(2.8, pig.runZMax);

    if (!pig.isBoss && Math.random() < state.eliteChance) {
      const trait = ELITE_TRAITS[Math.floor(Math.random() * ELITE_TRAITS.length)];
      pig.eliteTrait = trait.id;
      pig.eliteColor = trait.color;
      pig.name = `${trait.name} ${pig.name}`;
      trait.apply(pig);
    }

    return pig;
  }

  function spawnPig() {
    if (countRegularPigs() >= state.maxPigs) {
      return;
    }
    const fromLeft = Math.random() < 0.5;
    const type = choosePigType();
    const x = fromLeft ? rand(150, 260) : rand(700, 810);
    const z = rand(0.16, 0.9);
    state.pigs.push(createPig(type, x, z));
  }

  function spawnBoss() {
    if (getBossPig() || state.bossDefeated) {
      return;
    }
    state.pigs.push(createPig("boss", 480, 0.22));
    state.bossSpawned = true;
    state.bossBannerTimer = 3.2;
    state.bossBannerText = `BOSS HOG L${state.level}`;
    triggerImpact(9, 0.05);
  }

  function spawnCarrot(x = rand(170, 790), z = rand(0.18, 0.92), fromMelee = false) {
    state.carrots.push({
      x,
      z,
      ttl: fromMelee ? rand(10, 13) : rand(9, 13),
      waver: rand(0, Math.PI * 2),
      spawnedFromMelee: fromMelee,
      spawnPulse: fromMelee ? 0.45 : 0,
    });
  }

  function hardReset() {
    state.time = 0;
    state.level = 1;
    state.levelKillCount = 0;
    state.score = 0;
    state.killCount = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.comboMult = 1;
    state.shake = 0;
    state.hitStop = 0;
    state.spawnTimer = 1;
    state.carrotTimer = 4.6;
    state.upgradeChoices = [];
    state.upgradePicks = 0;
    state.upgradeHistory = {};
    state.bossBannerTimer = 0;
    state.bossBannerText = "BOSS HOG ENTERS";
    state.furyMeter = 0;
    state.furyMax = 100;
    state.furyActive = false;
    state.furyTimer = 0;
    state.furyBannerTimer = 0;
    state.furyBannerText = "FURY READY (C)";
    state.meleeCarrotCooldown = 0;
    state.nextPigId = 1;
    state.nextExplosionId = 1;
    state.explosionStats = {};
    state.pigs.length = 0;
    state.carrots.length = 0;
    state.grenades.length = 0;
    recycleAll(state.explosions, state.explosionPool);
    recycleAll(state.splatters, state.splatterPool);
    recycleAll(state.popups, state.popupPool);
    resetTouchPointer();
    state.touch.autoFireTimer = 0;
    resetPlayer();
    startThreatLevel(1, false);
  }

  resetPlayer();

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
      }
      return;
    }
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  window.addEventListener("keydown", (event) => {
    const { code } = event;
    if (isActionPress(event, "fullscreen")) {
      toggleFullscreen();
      event.preventDefault();
      return;
    }
    if (code === "Escape" && document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    keysDown.add(code);

    if (state.mode === MODES.START && isActionPress(event, "start")) {
      setControlScheme(CONTROL_SCHEMES.KEYBOARD);
      hardReset();
      event.preventDefault();
      return;
    }
    if (state.mode === MODES.OVER && isActionPress(event, "restart")) {
      setControlScheme(CONTROL_SCHEMES.KEYBOARD);
      hardReset();
      event.preventDefault();
      return;
    }

    if (state.mode === MODES.UPGRADE) {
      const indexMap = {
        Digit1: 0,
        Numpad1: 0,
        Digit2: 1,
        Numpad2: 1,
        Digit3: 2,
        Numpad3: 2,
      };
      const pickIndex = event.repeat ? null : code === "Enter" ? 0 : indexMap[code];
      if (pickIndex != null && state.upgradeChoices[pickIndex]) {
        applyUpgradeChoice(state.upgradeChoices[pickIndex]);
        startThreatLevel(state.level + 1, true);
        event.preventDefault();
      }
      return;
    }

    if (state.mode !== MODES.PLAYING) {
      return;
    }

    if (isActionPress(event, "jump") && state.player.onGround) {
      state.player.vy = state.player.jump;
      state.player.onGround = false;
      event.preventDefault();
    }

    if (isActionPress(event, "fire")) {
      tryPrimaryFire();
      event.preventDefault();
      return;
    }

    if (isActionPress(event, "fury")) {
      activateFury();
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    keysDown.delete(event.code);
  });

  function handlePointerDown(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (state.mode === MODES.START) {
      if (pointInTouchStartButton(x, y)) {
        setControlScheme(CONTROL_SCHEMES.TOUCH);
        state.touch.mouseSim = event.pointerType === "mouse";
        hardReset();
        return true;
      }
      return false;
    }

    if (state.mode === MODES.OVER) {
      if (isTouchControls()) {
        hardReset();
        return true;
      }
      return false;
    }

    if (state.mode === MODES.UPGRADE) {
      if (!isTouchControls()) {
        return false;
      }
      const pickIndex = getUpgradeCardIndexAtPoint(x, y);
      if (pickIndex >= 0 && state.upgradeChoices[pickIndex]) {
        applyUpgradeChoice(state.upgradeChoices[pickIndex]);
        startThreatLevel(state.level + 1, true);
        return true;
      }
      return false;
    }

    if (!isTouchControls() || state.mode !== MODES.PLAYING) {
      return false;
    }

    if (pointInFuryBar(x, y)) {
      activateFury();
      return true;
    }

    if (state.touch.mouseSim && event.pointerType === "mouse") {
      state.touch.active = true;
      state.touch.x = x;
      state.touch.y = y;
      return true;
    }

    state.touch.active = true;
    state.touch.pointerId = event.pointerId;
    state.touch.x = x;
    state.touch.y = y;
    return true;
  }

  function handlePointerMove(event) {
    if (!isTouchControls() || state.mode !== MODES.PLAYING) {
      return false;
    }
    if (state.touch.mouseSim && event.pointerType === "mouse") {
      state.touch.active = true;
      state.touch.x = event.offsetX;
      state.touch.y = event.offsetY;
      return true;
    }
    if (!state.touch.active || state.touch.pointerId !== event.pointerId) {
      return false;
    }
    state.touch.x = event.offsetX;
    state.touch.y = event.offsetY;
    return true;
  }

  function handlePointerUp(event) {
    if (!isTouchControls()) {
      return false;
    }
    if (state.touch.mouseSim && event.pointerType === "mouse") {
      return true;
    }
    if (state.touch.active && state.touch.pointerId === event.pointerId) {
      resetTouchPointer();
      return true;
    }
    return false;
  }

  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", (event) => {
    const handled = handlePointerDown(event);
    if (handled) {
      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch (_err) {
          // Ignore unsupported capture paths.
        }
      }
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointermove", (event) => {
    if (handlePointerMove(event)) {
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    const handled = handlePointerUp(event);
    if (handled) {
      if (canvas.releasePointerCapture) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch (_err) {
          // Ignore unsupported release paths.
        }
      }
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (handlePointerUp(event)) {
      event.preventDefault();
    }
  });

  function tryPrimaryFire() {
    const p = state.player;
    if (p.fireCooldown > 0 || p.meleeRecovery > 0) {
      return;
    }
    if (p.ammo > 0) {
      tryFireGrenade();
      return;
    }
    tryMeleeSwipe();
  }

  function tryMeleeSwipe() {
    const p = state.player;
    if (p.meleeStartup > 0 || p.meleeActive > 0 || p.meleeRecovery > 0) {
      return;
    }
    p.meleeStartup = 0.06;
    p.meleeActive = 0;
    p.meleeRecovery = 0.34;
    p.fireCooldown = p.meleeStartup + p.meleeRecovery;
    p.meleeTrail = 0.3;
    p.meleeFlash = 0.12;
    p.meleeHitIds = new Set();

    const face = normalize2(p.facingX, p.facingZ, 760);
    p.vx += face.x * 180;
    p.vz += face.z * 0.46;
    triggerImpact(8, 0.028);
  }

  function tryFireGrenade() {
    const p = state.player;
    if (p.fireCooldown > 0 || p.ammo <= 0) {
      return;
    }

    const furyMult = state.furyActive ? 1.22 : 1;
    p.fireCooldown = state.furyActive ? 0.08 : 0.15;
    p.ammo -= 1;

    const face = normalize2(p.facingX, p.facingZ, 680);
    p.vx -= face.x * (state.furyActive ? 10 : 18);
    p.vz -= face.z * (state.furyActive ? 0.03 : 0.05);
    state.grenades.push({
      x: p.x + face.x * 22,
      z: clamp(p.z + face.z * 0.065, ARENA.minZ, ARENA.maxZ),
      height: 34,
      vx: face.x * (470 * furyMult) + p.vx * 0.28,
      vz: face.z * (1.05 * furyMult) + p.vz * 0.28,
      vy: 660 * furyMult,
      fuse: state.furyActive ? 2.1 : 1.9,
      bounces: 0,
      maxBounces: 10 + Math.max(0, Math.floor(p.grenadeBounceBonus || 0)),
      furyShot: state.furyActive,
      firedAt: state.time,
    });
  }

  function processMeleeHits() {
    const p = state.player;
    if (p.meleeActive <= 0) {
      return;
    }

    const facing = normalize2(p.facingX, p.facingZ, 760);
    const slashRange = 304 * (p.meleeRangeMult || 1);
    const arcThreshold = 0.08;

    for (const pig of state.pigs) {
      if (p.meleeHitIds.has(pig.id)) {
        continue;
      }

      const dx = pig.x - p.x;
      const dz = (pig.z - p.z) * 760;
      const dist = Math.hypot(dx, dz);
      if (dist > slashRange + pig.radius) {
        continue;
      }

      const dir = normalize2(dx, dz / 760, 760);
      const dot = facing.x * dir.x + facing.z * dir.z;
      if (dot < arcThreshold) {
        continue;
      }

      p.meleeHitIds.add(pig.id);
      const damage = (state.furyActive ? 4 : 3) + (p.meleeDamageBonus || 0);
      pig.hp -= damage;
      pig.hitFlash = 0.18;
      pig.lastDamageMeta = {
        source: "melee",
        airborne: pig.height > 20,
        furyShot: state.furyActive,
      };

      const knock = normalize2(pig.x - p.x, pig.z - p.z, 760);
      pig.vx += knock.x * (pig.isBoss ? 220 : 180);
      pig.vz += knock.z * (pig.isBoss ? 0.4 : 0.34);
      pig.vy = Math.max(pig.vy, pig.isBoss ? 380 : 300);
      emitPigSplatter(pig, damage, p.x, p.z);
      addFury(8 + damage + (pig.isBoss ? 4 : 0));
      pushPopup("MACHETE", pig.x, pig.z, "#9de7ff", 0.55, 14);
      triggerImpact(pig.isBoss ? 10 : 8, pig.isBoss ? 0.06 : 0.05);
    }
  }

  function emitPigSplatter(pig, intensity, fromX, fromZ) {
    const baseCount = pig.isBoss ? 24 : 9;
    const count = baseCount + intensity * 4;
    for (let i = 0; i < count; i += 1) {
      const kick = normalize2(
        pig.x - fromX + rand(-42, 42),
        pig.z - fromZ + rand(-0.08, 0.08),
        760,
      );
      const speed = rand(80, 240) + (pig.isBoss ? 90 : 0);
      const splatter = acquirePooledObject(state.splatterPool);
      splatter.x = pig.x + rand(-8, 8);
      splatter.z = clamp(pig.z + rand(-0.02, 0.02), ARENA.minZ, ARENA.maxZ);
      splatter.height = pig.height + rand(8, 34);
      splatter.vx = kick.x * speed + rand(-40, 40);
      splatter.vz = kick.z * 0.7 + rand(-0.07, 0.07);
      splatter.vy = rand(180, 480) + (pig.isBoss ? 80 : 0);
      splatter.age = 0;
      splatter.ttl = rand(0.38, 0.92);
      splatter.size = rand(2.2, 4.8) * pig.splatterScale;
      splatter.angle = rand(0, Math.PI);
      splatter.tone = Math.random() < 0.5 ? "#7cff3d" : Math.random() < 0.5 ? "#5fd53f" : "#47aa2f";
      state.splatters.push(splatter);
    }
  }

  function spawnExplosion(x, z, height = 0, meta = {}) {
    const explosionId = state.nextExplosionId;
    state.nextExplosionId += 1;
    const p = state.player;
    const playerBlastRadius = meta.source === "grenade" ? p.grenadeRadiusMult || 1 : 1;
    const playerBlastDamage = meta.source === "grenade" ? p.grenadeDamageMult || 1 : 1;
    const radiusMult = (meta.furyShot ? 1.3 : meta.source === "boss" ? 1.12 : 1) * playerBlastRadius;
    const damageMult = (meta.furyShot ? 1.28 : 1) * (meta.damageScale || 1) * playerBlastDamage;
    const explosion = acquirePooledObject(state.explosionPool);
    explosion.id = explosionId;
    explosion.x = x;
    explosion.z = z;
    explosion.height = height;
    explosion.age = 0;
    explosion.ttl = 0.42;
    explosion.maxRadius = 175 * radiusMult;
    explosion.furyShot = !!meta.furyShot;
    state.explosions.push(explosion);
    state.explosionStats[explosionId] = { kills: 0, ttl: 2 };

    let totalDamage = 0;
    let hitCount = 0;
    let playerHit = false;

    for (const pig of state.pigs) {
      if (meta.sourcePig && pig === meta.sourcePig) {
        continue;
      }
      const blastRange = (pig.isBoss ? 220 : 175) * radiusMult;
      const dist = arenaDistance(pig, { x, z });
      if (dist <= blastRange) {
        const baseDamage = pig.isBoss ? 5 : 4;
        const damage = Math.max(1, Math.round((baseDamage - dist / 72) * damageMult));
        pig.hp -= damage;
        pig.hitFlash = 0.16;
        emitPigSplatter(pig, damage, x, z);
        pig.lastDamageMeta = {
          source: meta.source || "grenade",
          explosionId,
          grenadeBounces: meta.grenadeBounces || 0,
          airborne: pig.height > 20,
          furyShot: !!meta.furyShot,
        };
        totalDamage += damage;
        hitCount += 1;
        addFury(2 + damage + (pig.isBoss ? 3 : 0));

        const kick = normalize2(pig.x - x, pig.z - z, 760);
        const kickMult = meta.furyShot ? 1.15 : 1;
        pig.vx += kick.x * (pig.isBoss ? 180 : 130) * kickMult;
        pig.vz += kick.z * (pig.isBoss ? 0.34 : 0.28) * kickMult;
        pig.vy = Math.max(pig.vy, (pig.isBoss ? 400 : 320) * kickMult);
      }
    }

    const pRange = 170 * radiusMult + (meta.source === "boss" ? 50 : 0);
    const pDist = arenaDistance(p, { x, z });
    if (pDist <= pRange && p.invuln <= 0 && state.mode === MODES.PLAYING) {
      let pDamage = meta.source === "boss" ? 2 : pDist < 75 ? 2 : 1;
      if (state.furyActive && meta.source !== "boss") {
        pDamage = Math.max(0, pDamage - 1);
      }
      if (pDamage > 0) {
        playerHit = true;
        p.health -= pDamage;
        p.invuln = 0.6;
        const blastPush = normalize2(p.x - x, p.z - z, 760);
        p.vx += blastPush.x * (meta.source === "boss" ? 280 : 190);
        p.vz += blastPush.z * (meta.source === "boss" ? 0.72 : 0.46);
        p.vy = Math.max(p.vy, meta.source === "boss" ? 560 : 380);
        if (p.health <= 0) {
          transitionToMode(MODES.OVER);
        }
      }
    }

    for (const grenade of state.grenades) {
      const dist = arenaDistance(grenade, { x, z });
      if (dist <= 120) {
        grenade.fuse = Math.min(grenade.fuse, 0.05);
      }
    }

    const impactShake = meta.source === "boss" ? 12 : meta.furyShot ? 12 : 9;
    const freeze = clamp(0.03 + hitCount * 0.01 + totalDamage * 0.003 + (playerHit ? 0.015 : 0), 0, 0.1);
    triggerImpact(impactShake, freeze);
    return explosionId;
  }

  function onBossPhaseShift(pig) {
    pig.phase += 1;
    pig.runMin *= 1.1;
    pig.runMax *= 1.14;
    pig.jumpMin *= 1.08;
    pig.jumpMax *= 1.1;
    pig.hopMin *= 0.84;
    pig.hopMax *= 0.88;
    pig.contactDamage = Math.min(4, pig.contactDamage + 1);
    pig.summonCooldown = Math.max(2.2, pig.summonCooldown * 0.75);
    state.bossBannerText = `BOSS PHASE ${pig.phase}`;
    state.bossBannerTimer = 2.3;
    pushPopup(`PHASE ${pig.phase}`, pig.x, pig.z, "#ffd95c", 1.2, 20);
    triggerImpact(11, 0.06);
  }

  function awardKill(pig, damageMeta = null) {
    state.killCount += 1;
    state.levelKillCount += 1;
    if (state.comboTimer > 0) {
      state.combo += 1;
    } else {
      state.combo = 1;
    }
    state.comboTimer = 2.7;
    state.comboMult = 1 + Math.min(2.6, state.combo * 0.11);

    let scoreGain = Math.round(pig.scoreValue * state.comboMult);
    let bonus = 0;

    if (damageMeta && damageMeta.source === "grenade") {
      if (damageMeta.grenadeBounces >= 2) {
        const ricochet = 80 + Math.min(240, (damageMeta.grenadeBounces - 1) * 35);
        bonus += ricochet;
        pushPopup(`RICOCHET +${ricochet}`, pig.x, pig.z, "#8cff78", 1.1, 16);
      }
      if (damageMeta.airborne) {
        bonus += 90;
        pushPopup("AIR HAM +90", pig.x, pig.z, "#7ad8ff", 1.1, 16);
      }
      if (damageMeta.explosionId != null && state.explosionStats[damageMeta.explosionId]) {
        const chain = state.explosionStats[damageMeta.explosionId];
        chain.kills += 1;
        chain.ttl = Math.max(chain.ttl, 1.5);
        if (chain.kills >= 2) {
          const chainBonus = 70 * chain.kills;
          bonus += chainBonus;
          pushPopup(`CHAIN x${chain.kills} +${chainBonus}`, pig.x, pig.z, "#ffde66", 1.2, 18);
        }
      }
      if (damageMeta.furyShot) {
        bonus += 40;
      }
    } else if (damageMeta && damageMeta.source === "melee") {
      const meleeBonus = 120;
      bonus += meleeBonus;
      pushPopup(`CLOSE CALL +${meleeBonus}`, pig.x, pig.z, "#9de7ff", 1, 16);
      if (damageMeta.airborne) {
        bonus += 70;
        pushPopup("JUGGLE +70", pig.x, pig.z, "#8ce3ff", 1, 15);
      }
    }

    if (state.furyActive) {
      scoreGain = Math.round(scoreGain * 1.35);
    }
    const totalGain = scoreGain + bonus;
    state.score += totalGain;
    addFury(pig.isBoss ? 45 : 18);
    pushPopup(`+${totalGain}`, pig.x, pig.z, "#fff1a2", 0.85, 14);

    if (
      damageMeta &&
      damageMeta.source === "melee" &&
      state.meleeCarrotCooldown <= 0 &&
      state.carrots.length < 5
    ) {
      const carrotX = clamp(pig.x + rand(-14, 14), ARENA.minX + 20, ARENA.maxX - 20);
      const carrotZ = clamp(pig.z + rand(-0.02, 0.02), ARENA.minZ + 0.02, ARENA.maxZ - 0.02);
      spawnCarrot(carrotX, carrotZ, true);
      state.meleeCarrotCooldown = 0.4;
      pushPopup("CARROT DROP", carrotX, carrotZ, "#9cff7a", 0.95, 14);
    }

    if (pig.deathExplosion) {
      spawnExplosion(pig.x, pig.z, pig.height, {
        source: "elite",
        damageScale: 0.72,
        sourcePig: pig,
      });
      pushPopup("ELITE POP!", pig.x, pig.z, pig.eliteColor || "#a6ff78", 0.9, 14);
    }

    if (pig.isBoss) {
      state.bossDefeated = true;
      state.bossBannerTimer = 3.2;
      state.bossBannerText = `BOSS HOG DOWN L${state.level}`;
      enterUpgradeDraft();
      triggerImpact(12, 0.08);
      return;
    }
  }

  function updatePlayer(dt) {
    const p = state.player;
    let axisX = 0;
    let axisZ = 0;
    if (isTouchControls()) {
      if (state.touch.active) {
        const projected = projectToScreen(p.x, p.z, p.height);
        const dx = state.touch.x - projected.x;
        const dz = state.touch.y - projected.groundY;
        const deadZone = 14;
        axisX = Math.abs(dx) > deadZone ? clamp(dx / 90, -1, 1) : 0;
        axisZ = Math.abs(dz) > deadZone ? clamp(dz / 68, -1, 1) : 0;
      }
    } else {
      const moveLeft = anyDown("moveLeft");
      const moveRight = anyDown("moveRight");
      const moveUp = anyDown("moveUp");
      const moveDown = anyDown("moveDown");
      axisX = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
      axisZ = (moveDown ? 1 : 0) - (moveUp ? 1 : 0);
    }

    if (axisX !== 0 || axisZ !== 0) {
      p.facingX = axisX;
      p.facingZ = axisZ;
    }

    const furySpeed = state.furyActive ? 1.2 : 1;
    const targetX = axisX * p.speedX * furySpeed;
    const targetZ = axisZ * p.speedZ * furySpeed;
    const accel = p.onGround ? 15 : 8;
    const drag = p.onGround ? 10 : 5;

    if (axisX !== 0) {
      p.vx += (targetX - p.vx) * Math.min(1, accel * dt);
    } else {
      p.vx -= p.vx * Math.min(1, drag * dt);
    }

    if (axisZ !== 0) {
      p.vz += (targetZ - p.vz) * Math.min(1, accel * dt);
    } else {
      p.vz -= p.vz * Math.min(1, drag * dt);
    }

    p.x += p.vx * dt;
    p.z += p.vz * dt;
    p.x = clamp(p.x, ARENA.minX + 18, ARENA.maxX - 18);
    p.z = clamp(p.z, ARENA.minZ + 0.01, ARENA.maxZ - 0.01);

    p.vy -= GRAVITY * dt;
    p.height += p.vy * dt;
    if (p.height <= 0) {
      p.height = 0;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false;
    }

    p.fireCooldown = Math.max(0, p.fireCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.meleeTrail = Math.max(0, p.meleeTrail - dt);
    p.meleeFlash = Math.max(0, p.meleeFlash - dt);
    p.meleeRecovery = Math.max(0, p.meleeRecovery - dt);
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    state.bossBannerTimer = Math.max(0, state.bossBannerTimer - dt);
    state.furyBannerTimer = Math.max(0, state.furyBannerTimer - dt);
    state.meleeCarrotCooldown = Math.max(0, state.meleeCarrotCooldown - dt);

    if (p.meleeStartup > 0) {
      p.meleeStartup = Math.max(0, p.meleeStartup - dt);
      if (p.meleeStartup <= 0) {
        p.meleeActive = 0.1;
      }
    }
    if (p.meleeActive > 0) {
      p.meleeActive = Math.max(0, p.meleeActive - dt);
      processMeleeHits();
    }

    if (state.furyActive) {
      state.furyTimer = Math.max(0, state.furyTimer - dt);
      if (state.furyTimer <= 0) {
        state.furyActive = false;
        state.furyBannerTimer = 1.6;
        state.furyBannerText = "FURY OVER";
        state.bossBannerText = "FURY OVER";
      }
    }

    if (state.comboTimer <= 0) {
      state.combo = 0;
      state.comboMult = 1;
    }
  }

  function aimPlayerAtNearestPig() {
    const p = state.player;
    let target = null;
    let best = Infinity;
    for (const pig of state.pigs) {
      const dist = arenaDistance(p, pig);
      if (dist < best) {
        best = dist;
        target = pig;
      }
    }
    if (!target) {
      return false;
    }
    const aim = normalize2(target.x - p.x, target.z - p.z, 760);
    p.facingX = aim.x;
    p.facingZ = aim.z;
    return true;
  }

  function updateTouchAutoFire(dt) {
    if (!isTouchControls() || state.mode !== MODES.PLAYING) {
      return;
    }
    state.touch.autoFireTimer -= dt;
    if (state.touch.autoFireTimer > 0) {
      return;
    }
    if (!aimPlayerAtNearestPig()) {
      state.touch.autoFireTimer = 0.08;
      return;
    }
    tryPrimaryFire();
    state.touch.autoFireTimer = state.furyActive ? 0.09 : state.touch.autoFireInterval;
  }

  function updateGrenades(dt) {
    for (let i = state.grenades.length - 1; i >= 0; i -= 1) {
      const g = state.grenades[i];
      const maxBounces = g.maxBounces || 10;
      g.x += g.vx * dt;
      g.z += g.vz * dt;
      g.height += g.vy * dt;
      g.vy -= GRAVITY * 1.08 * dt;
      g.fuse -= dt;

      if (g.x < ARENA.minX + 8) {
        g.x = ARENA.minX + 8;
        g.vx = Math.abs(g.vx) * 0.8;
        g.bounces += 1;
      } else if (g.x > ARENA.maxX - 8) {
        g.x = ARENA.maxX - 8;
        g.vx = -Math.abs(g.vx) * 0.8;
        g.bounces += 1;
      }

      if (g.z < ARENA.minZ + 0.01) {
        g.z = ARENA.minZ + 0.01;
        g.vz = Math.abs(g.vz) * 0.86;
        g.bounces += 1;
      } else if (g.z > ARENA.maxZ - 0.01) {
        g.z = ARENA.maxZ - 0.01;
        g.vz = -Math.abs(g.vz) * 0.86;
        g.bounces += 1;
      }

      if (g.height <= 0) {
        g.height = 0;
        if (Math.abs(g.vy) > 130 && g.bounces < maxBounces - 1) {
          g.vy = -g.vy * 0.74;
          g.vx *= 0.93;
          g.vz *= 0.93;
          g.bounces += 1;
        } else {
          g.vy = 0;
          g.vx *= Math.max(0, 1 - 4.2 * dt);
          g.vz *= Math.max(0, 1 - 4.2 * dt);
          if (Math.hypot(g.vx, g.vz * 640) < 28 && g.bounces > 1) {
            g.fuse = Math.min(g.fuse, 0.1);
          }
        }
      }

      let detonate = g.fuse <= 0 || g.bounces >= maxBounces;
      if (!detonate) {
        for (const pig of state.pigs) {
          if (arenaDistance(g, pig) < pig.radius + 15 && g.height <= pig.height + pig.radius * 1.2) {
            detonate = true;
            break;
          }
        }
      }

      if (detonate) {
        spawnExplosion(g.x, g.z, g.height, {
          source: "grenade",
          grenadeBounces: g.bounces,
          furyShot: g.furyShot,
          age: state.time - g.firedAt,
        });
        state.grenades.splice(i, 1);
      }
    }
  }

  function updatePigs(dt) {
    const p = state.player;

    for (let i = state.pigs.length - 1; i >= 0; i -= 1) {
      const pig = state.pigs[i];
      const wasAirborne = pig.height > 2;

      pig.hopCooldown -= dt;
      if (pig.isBoss) {
        pig.stompCooldown = Math.max(0, pig.stompCooldown - dt);
        pig.summonCooldown = Math.max(0, pig.summonCooldown - dt);
      }

      if (pig.hopCooldown <= 0 && pig.height === 0) {
        const toPlayer = normalize2(
          p.x - pig.x + rand(-pig.driftX, pig.driftX),
          p.z - pig.z + rand(-pig.driftZ, pig.driftZ),
          760,
        );
        pig.vx = toPlayer.x * rand(pig.runMin, pig.runMax);
        pig.vz = toPlayer.z * rand(pig.runZMin, pig.runZMax);
        pig.vy = rand(pig.jumpMin, pig.jumpMax);
        pig.hopCooldown = rand(pig.hopMin, pig.hopMax);

        if (pig.isBoss && Math.random() < 0.22) {
          pig.vy *= 1.22;
          pig.vx *= 1.14;
          pig.vz *= 1.12;
        }
        if (pig.isBoss && pig.phase >= 4 && Math.random() < 0.35) {
          pig.hopCooldown *= 0.45;
        }
      }

      pig.x += pig.vx * dt;
      pig.z += pig.vz * dt;
      pig.height += pig.vy * dt;
      pig.vy -= GRAVITY * 1.05 * dt;
      pig.hitFlash = Math.max(0, pig.hitFlash - dt);

      const edge = pig.radius * 0.82;
      if (pig.x < ARENA.minX + edge) {
        pig.x = ARENA.minX + edge;
        pig.vx = Math.abs(pig.vx) * 0.8;
      } else if (pig.x > ARENA.maxX - edge) {
        pig.x = ARENA.maxX - edge;
        pig.vx = -Math.abs(pig.vx) * 0.8;
      }

      if (pig.z < ARENA.minZ + 0.01) {
        pig.z = ARENA.minZ + 0.01;
        pig.vz = Math.abs(pig.vz) * 0.86;
      } else if (pig.z > ARENA.maxZ - 0.01) {
        pig.z = ARENA.maxZ - 0.01;
        pig.vz = -Math.abs(pig.vz) * 0.86;
      }

      if (pig.height <= 0) {
        const impactVy = Math.abs(pig.vy);
        pig.height = 0;
        if (impactVy > 140) {
          pig.vy = -pig.vy * pig.bounceDamp;
        } else {
          pig.vy = 0;
        }
        pig.vx *= Math.max(0, 1 - pig.drag * dt);
        pig.vz *= Math.max(0, 1 - pig.drag * dt);

        if (pig.isBoss && wasAirborne && impactVy > 280 && pig.phase >= 2 && pig.stompCooldown <= 0) {
          spawnExplosion(pig.x, pig.z, 0, {
            source: "boss",
            damageScale: 0.95 + pig.phase * 0.08,
            sourcePig: pig,
          });
          pig.stompCooldown = Math.max(0.75, 2.1 - pig.phase * 0.22);
        }
      }

      if (pig.isBoss) {
        while (
          pig.phaseIndex < pig.phaseThresholds.length &&
          pig.hp / pig.maxHp <= pig.phaseThresholds[pig.phaseIndex]
        ) {
          pig.phaseIndex += 1;
          onBossPhaseShift(pig);
          if (pig.phase >= 3) {
            spawnExplosion(pig.x, pig.z, pig.height, {
              source: "boss",
              damageScale: 0.75,
              sourcePig: pig,
            });
          }
        }

        if (pig.phase >= 3 && pig.summonCooldown <= 0 && countRegularPigs() < state.maxPigs + 1) {
          const summonType = choosePigType();
          const sx = clamp(pig.x + rand(-110, 110), ARENA.minX + 20, ARENA.maxX - 20);
          const sz = clamp(pig.z + rand(-0.08, 0.08), ARENA.minZ + 0.02, ARENA.maxZ - 0.02);
          state.pigs.push(createPig(summonType, sx, sz));
          pig.summonCooldown = Math.max(1.4, rand(3.2, 5.6) - (pig.phase - 2) * 0.32);
          pushPopup("REINFORCEMENTS!", pig.x, pig.z, "#ffca6e", 1.1, 14);
        }
      }

      if (pig.hp <= 0) {
        emitPigSplatter(pig, pig.isBoss ? 9 : 5, pig.x, pig.z);
        awardKill(pig, pig.lastDamageMeta);
        state.pigs.splice(i, 1);
        if (state.mode !== MODES.PLAYING) {
          return;
        }
        continue;
      }

      const hitDist = arenaDistance(pig, p);
      if (hitDist < pig.radius + p.radius + 2 && p.invuln <= 0 && pig.height < 55 && p.height < 48) {
        p.health -= pig.contactDamage;
        p.invuln = 0.86;
        const push = normalize2(p.x - pig.x, p.z - pig.z, 760);
        p.vx = push.x * pig.knockback;
        p.vz = push.z * (pig.knockback / 380);
        p.vy = Math.max(p.vy, pig.launch);
        triggerImpact(pig.isBoss ? 11 : 7, pig.isBoss ? 0.05 : 0.03);
        if (p.health <= 0) {
          transitionToMode(MODES.OVER);
        }
      }
    }
  }

  function updateCarrots(dt) {
    const p = state.player;
    for (let i = state.carrots.length - 1; i >= 0; i -= 1) {
      const carrot = state.carrots[i];
      carrot.ttl -= dt;
      carrot.waver += dt * 5;
      carrot.spawnPulse = Math.max(0, (carrot.spawnPulse || 0) - dt);
      if (carrot.ttl <= 0) {
        state.carrots.splice(i, 1);
        continue;
      }

      if (state.furyActive) {
        const pullDist = arenaDistance(carrot, p);
        if (pullDist > 1) {
          const towardPlayer = normalize2(p.x - carrot.x, p.z - carrot.z, 760);
          const pullScale = clamp(1.2 - pullDist / 1300, 0.35, 1.2);
          const pullAmount = (220 + (1 - pullScale) * 180) * dt;
          carrot.x = clamp(carrot.x + towardPlayer.x * pullAmount, ARENA.minX + 10, ARENA.maxX - 10);
          carrot.z = clamp(carrot.z + towardPlayer.z * pullAmount, ARENA.minZ + 0.01, ARENA.maxZ - 0.01);
        }
      }

      if (arenaDistance(carrot, p) < 28 && p.height < 44) {
        p.carrotsEaten += 1;
        p.health = Math.min(p.maxHealth, p.health + 2);
        p.ammo = Math.min(p.maxAmmo, p.ammo + 6);
        state.score += 20;
        addFury(26);
        pushPopup("CARROT +FURY", carrot.x, carrot.z, "#8eff6b", 0.9, 14);
        state.carrots.splice(i, 1);
      }
    }
  }

  function updateExplosions(dt) {
    for (let i = state.explosions.length - 1; i >= 0; i -= 1) {
      const ex = state.explosions[i];
      ex.age += dt;
      if (ex.age >= ex.ttl) {
        recycleAt(state.explosions, i, state.explosionPool);
      }
    }
  }

  function updateSplatters(dt) {
    for (let i = state.splatters.length - 1; i >= 0; i -= 1) {
      const s = state.splatters[i];
      s.age += dt;
      s.x += s.vx * dt;
      s.z += s.vz * dt;
      s.height += s.vy * dt;
      s.vy -= GRAVITY * 0.95 * dt;

      if (s.x < ARENA.minX) {
        s.x = ARENA.minX;
        s.vx = Math.abs(s.vx) * 0.45;
      } else if (s.x > ARENA.maxX) {
        s.x = ARENA.maxX;
        s.vx = -Math.abs(s.vx) * 0.45;
      }

      if (s.z < ARENA.minZ) {
        s.z = ARENA.minZ;
        s.vz = Math.abs(s.vz) * 0.55;
      } else if (s.z > ARENA.maxZ) {
        s.z = ARENA.maxZ;
        s.vz = -Math.abs(s.vz) * 0.55;
      }

      if (s.height <= 0) {
        s.height = 0;
        s.vy = Math.abs(s.vy) * 0.18;
        s.vx *= 0.72;
        s.vz *= 0.72;
      }

      const done = s.age >= s.ttl;
      const rested = s.height === 0 && Math.hypot(s.vx, s.vz * 760) < 20 && s.age > 0.2;
      if (done || rested) {
        recycleAt(state.splatters, i, state.splatterPool);
      }
    }
  }

  function updatePopups(dt) {
    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      const popup = state.popups[i];
      popup.age += dt;
      popup.z = clamp(popup.z - dt * 0.03, ARENA.minZ, ARENA.maxZ);
      popup.wobble += dt * 7;
      if (popup.age >= popup.ttl) {
        recycleAt(state.popups, i, state.popupPool);
      }
    }
  }

  function updateExplosionStats(dt) {
    const ids = Object.keys(state.explosionStats);
    for (const id of ids) {
      const stat = state.explosionStats[id];
      stat.ttl -= dt;
      if (stat.ttl <= 0) {
        delete state.explosionStats[id];
      }
    }
  }

  function updateSpawns(dt) {
    if (!state.bossSpawned && state.levelKillCount >= state.bossThreshold) {
      spawnBoss();
      state.spawnTimer = rand(1.8, 2.8);
    }

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const bossAlive = !!getBossPig();
      const maxRegular = bossAlive ? Math.max(2, state.maxPigs - 1) : state.maxPigs;
      if (countRegularPigs() < maxRegular) {
        spawnPig();
      }
      const pace = 1 / (state.pigAggroMult || 1);
      state.spawnTimer = Math.max(0.32, rand(0.9, 2.4) * pace + countRegularPigs() * 0.09);
    }

    state.carrotTimer -= dt;
    if (state.carrotTimer <= 0) {
      if (state.carrots.length < 2) {
        spawnCarrot();
      }
      state.carrotTimer = rand(5.4, 8.6);
    }
  }

  function updateInactiveMode(step) {
    state.shake = Math.max(0, state.shake - 18 * step);
    state.bossBannerTimer = Math.max(0, state.bossBannerTimer - step);
    state.furyBannerTimer = Math.max(0, state.furyBannerTimer - step);
    updatePopups(step);
    updateExplosionStats(step);
  }

  function updatePlayingMode(step) {
    updatePlayer(step);
    updateTouchAutoFire(step);
    updateSpawns(step);
    updateGrenades(step);
    updatePigs(step);
    updateCarrots(step);
    updateExplosions(step);
    updateSplatters(step);
    updatePopups(step);
    updateExplosionStats(step);
    state.shake = Math.max(0, state.shake - 30 * step);
  }

  function update(dt) {
    const step = Math.min(0.033, dt);
    state.time += step;

    if (state.hitStop > 0) {
      state.hitStop = Math.max(0, state.hitStop - step);
      return;
    }

    if (state.mode !== MODES.PLAYING) {
      updateInactiveMode(step);
      return;
    }
    updatePlayingMode(step);
  }

  function drawArenaBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, "#7fd0ff");
    sky.addColorStop(0.5, "#5ca7d8");
    sky.addColorStop(1, "#26456f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    ctx.fillStyle = "#5d7aa5";
    ctx.fillRect(0, HORIZON_Y - 10, VIEW_W, 8);

    for (let i = 0; i < backdropPeaks.length; i += 1) {
      const peak = backdropPeaks[i];
      ctx.fillStyle = i % 2 === 0 ? "#3d5f7a" : "#4a7090";
      ctx.beginPath();
      ctx.moveTo(peak.x, HORIZON_Y + 6);
      ctx.lineTo(peak.x + 100, HORIZON_Y - peak.height);
      ctx.lineTo(peak.x + 240, HORIZON_Y + 6);
      ctx.closePath();
      ctx.fill();
    }

    const farL = projectToScreen(ARENA.minX, ARENA.minZ, 0);
    const farR = projectToScreen(ARENA.maxX, ARENA.minZ, 0);
    const nearL = projectToScreen(ARENA.minX, ARENA.maxZ, 0);
    const nearR = projectToScreen(ARENA.maxX, ARENA.maxZ, 0);

    const floor = ctx.createLinearGradient(0, farL.groundY, 0, nearL.groundY);
    floor.addColorStop(0, "#345975");
    floor.addColorStop(1, "#2f6e57");
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.moveTo(farL.x, farL.groundY);
    ctx.lineTo(farR.x, farR.groundY);
    ctx.lineTo(nearR.x, nearR.groundY);
    ctx.lineTo(nearL.x, nearL.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(161, 228, 190, 0.35)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i += 1) {
      const z = ARENA.minZ + ((ARENA.maxZ - ARENA.minZ) * i) / 10;
      const left = projectToScreen(ARENA.minX, z, 0);
      const right = projectToScreen(ARENA.maxX, z, 0);
      ctx.beginPath();
      ctx.moveTo(left.x, left.groundY);
      ctx.lineTo(right.x, right.groundY);
      ctx.stroke();
    }

    for (let i = 0; i <= 8; i += 1) {
      const x = ARENA.minX + ((ARENA.maxX - ARENA.minX) * i) / 8;
      const near = projectToScreen(x, ARENA.maxZ, 0);
      const far = projectToScreen(x, ARENA.minZ, 0);
      ctx.beginPath();
      ctx.moveTo(near.x, near.groundY);
      ctx.lineTo(far.x, far.groundY);
      ctx.stroke();
    }

    ctx.strokeStyle = "#9cd7b6";
    ctx.lineWidth = 3;
    ctx.strokeRect(nearL.x - 1, nearL.groundY - 1, nearR.x - nearL.x + 2, 4);
  }

  function drawShadow(x, z, radius, alpha = 0.28, height = 0) {
    const p = projectToScreen(x, z, 0);
    const lift = clamp(1 - height / 220, 0.35, 1);
    ctx.fillStyle = `rgba(10, 20, 24, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(
      p.x,
      p.groundY + 2,
      radius * p.scale * lift,
      radius * 0.42 * p.scale * lift,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  function depthFade(z) {
    return 0.68 + clamp(z, ARENA.minZ, ARENA.maxZ) * 0.34;
  }

  function applyDepthOverlay(z, x, y, w, h) {
    const fade = 1 - depthFade(z);
    if (fade <= 0) {
      return;
    }
    ctx.fillStyle = `rgba(33, 56, 85, ${fade * 0.45})`;
    ctx.fillRect(x, y, w, h);
  }

  function drawRabbit(player) {
    if (player.invuln > 0 && Math.floor(state.time * 30) % 2 === 0) {
      return;
    }
    const body = projectToScreen(player.x, player.z, player.height);
    drawShadow(player.x, player.z, 22, 0.28, player.height);

    const s = body.scale;
    const bx = body.x;
    const by = body.y;

    if (state.furyActive) {
      const pulse = 0.65 + Math.sin(state.time * 16) * 0.2;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#97ff67";
      ctx.beginPath();
      ctx.ellipse(bx, by - 28 * s, 22 * s, 34 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d8ffb6";
      for (let i = 0; i < 3; i += 1) {
        const a = state.time * 9 + i * 2.1;
        const px = bx + Math.cos(a) * (18 + i * 2) * s;
        const py = by - 30 * s + Math.sin(a * 1.2) * 10 * s;
        ctx.fillRect(px - 1.5 * s, py - 1.5 * s, 3 * s, 3 * s);
      }
      ctx.globalAlpha = 1;
    }

    if (player.meleeTrail > 0) {
      const life = player.meleeTrail / 0.3;
      const face = normalize2(player.facingX, player.facingZ, 760);
      const sweepRot = Math.atan2(face.z * 2.2, face.x);
      const trailX = bx + face.x * 42 * s;
      const trailY = by - 20 * s + face.z * 30 * s;

      ctx.strokeStyle = `rgba(156, 229, 255, ${0.22 + life * 0.55})`;
      ctx.lineWidth = Math.max(2, 9 * s * life);
      ctx.beginPath();
      ctx.ellipse(
        trailX,
        trailY,
        76 * s,
        30 * s,
        sweepRot,
        -1.55,
        1.5,
      );
      ctx.stroke();

      ctx.strokeStyle = `rgba(245, 254, 255, ${0.35 + life * 0.55})`;
      ctx.lineWidth = Math.max(1, 4 * s * life);
      ctx.beginPath();
      ctx.ellipse(
        trailX + face.x * 10 * s,
        trailY + face.z * 4 * s,
        60 * s,
        22 * s,
        sweepRot,
        -1.42,
        1.3,
      );
      ctx.stroke();

      ctx.globalAlpha = 0.2 + life * 0.25;
      ctx.fillStyle = "#f2fdff";
      ctx.beginPath();
      ctx.ellipse(
        trailX + face.x * 18 * s,
        trailY + face.z * 8 * s,
        18 * s,
        8 * s,
        sweepRot,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = "#102033";
    ctx.lineWidth = Math.max(1, 1.2 * s);
    ctx.fillStyle = "#eceff3";
    ctx.fillRect(bx - 12 * s, by - 38 * s, 24 * s, 28 * s);
    ctx.strokeRect(bx - 12 * s, by - 38 * s, 24 * s, 28 * s);
    ctx.fillRect(bx - 11 * s, by - 64 * s, 7 * s, 24 * s);
    ctx.strokeRect(bx - 11 * s, by - 64 * s, 7 * s, 24 * s);
    ctx.fillRect(bx + 4 * s, by - 67 * s, 7 * s, 27 * s);
    ctx.strokeRect(bx + 4 * s, by - 67 * s, 7 * s, 27 * s);

    ctx.fillStyle = "#c51f30";
    ctx.fillRect(bx - 14 * s, by - 43 * s, 28 * s, 6 * s);
    ctx.strokeRect(bx - 14 * s, by - 43 * s, 28 * s, 6 * s);

    ctx.fillStyle = "#f7c8c8";
    ctx.fillRect(bx - 8 * s, by - 33 * s, 16 * s, 12 * s);
    ctx.strokeRect(bx - 8 * s, by - 33 * s, 16 * s, 12 * s);

    ctx.fillStyle = "#121924";
    const eyeOffset = player.facingX >= 0 ? 4 : -8;
    ctx.fillRect(bx + eyeOffset * s, by - 31 * s, 4 * s, 4 * s);

    const facing = normalize2(player.facingX, player.facingZ, 760);
    const lx = bx + facing.x * 18 * s;
    const ly = by - 26 * s + facing.z * 16 * s;
    if (Math.abs(facing.x) >= Math.abs(facing.z)) {
      ctx.fillStyle = "#576676";
      ctx.fillRect(lx - 8 * s, ly - 4 * s, 20 * s, 8 * s);
      ctx.strokeRect(lx - 8 * s, ly - 4 * s, 20 * s, 8 * s);
      ctx.fillStyle = "#a3afba";
      ctx.fillRect(lx + (facing.x > 0 ? 12 : -4) * s, ly - 3 * s, 6 * s, 6 * s);
      ctx.strokeRect(lx + (facing.x > 0 ? 12 : -4) * s, ly - 3 * s, 6 * s, 6 * s);
    } else {
      ctx.fillStyle = "#576676";
      ctx.fillRect(lx - 5 * s, ly - 9 * s, 10 * s, 20 * s);
      ctx.strokeRect(lx - 5 * s, ly - 9 * s, 10 * s, 20 * s);
      ctx.fillStyle = "#a3afba";
      ctx.fillRect(lx - 4 * s, ly + (facing.z > 0 ? 10 : -5) * s, 8 * s, 6 * s);
      ctx.strokeRect(lx - 4 * s, ly + (facing.z > 0 ? 10 : -5) * s, 8 * s, 6 * s);
    }
    applyDepthOverlay(player.z, bx - 18 * s, by - 70 * s, 46 * s, 74 * s);
  }

  function drawPig(pig) {
    const shadowRadius = pig.isBoss ? pig.radius * 1.25 : pig.radius * 0.95;
    drawShadow(pig.x, pig.z, shadowRadius, pig.isBoss ? 0.36 : 0.29, pig.height);

    const p = projectToScreen(pig.x, pig.z, pig.height);
    const base = p.scale * (pig.radius / 19);
    const x = p.x;
    const y = p.y;

    ctx.strokeStyle = "#1c2030";
    ctx.lineWidth = Math.max(1, 1.2 * base);
    ctx.fillStyle = pig.hitFlash > 0 ? "#ffffff" : pig.bodyColor;
    ctx.fillRect(x - 19 * base, y - 30 * base, 38 * base, 24 * base);
    ctx.strokeRect(x - 19 * base, y - 30 * base, 38 * base, 24 * base);
    ctx.fillRect(x - 14 * base, y - 39 * base, 28 * base, 11 * base);
    ctx.strokeRect(x - 14 * base, y - 39 * base, 28 * base, 11 * base);

    ctx.fillStyle = pig.snoutColor;
    ctx.fillRect(x + 8 * base, y - 26 * base, 11 * base, 10 * base);
    ctx.strokeRect(x + 8 * base, y - 26 * base, 11 * base, 10 * base);

    ctx.fillStyle = "#131416";
    ctx.fillRect(x + 9 * base, y - 35 * base, 4 * base, 4 * base);

    ctx.fillStyle = pig.legColor;
    ctx.fillRect(x - 13 * base, y - 6 * base, 8 * base, 4 * base);
    ctx.fillRect(x + 5 * base, y - 6 * base, 8 * base, 4 * base);

    if (pig.isBoss) {
      ctx.fillStyle = "#ffd95c";
      ctx.fillRect(x - 10 * base, y - 49 * base, 20 * base, 6 * base);
      ctx.fillRect(x - 8 * base, y - 53 * base, 4 * base, 4 * base);
      ctx.fillRect(x - 1 * base, y - 56 * base, 4 * base, 7 * base);
      ctx.fillRect(x + 6 * base, y - 53 * base, 4 * base, 4 * base);
      ctx.fillStyle = "rgba(17, 12, 0, 0.35)";
      ctx.fillRect(x - 20 * base, y - 44 * base, 40 * base, 3 * base);
    }

    if (pig.eliteTrait) {
      ctx.strokeStyle = pig.eliteColor || "#a6ff78";
      ctx.lineWidth = Math.max(1, 2 * base);
      ctx.strokeRect(x - 22 * base, y - 41 * base, 44 * base, 37 * base);
      ctx.fillStyle = pig.eliteColor || "#a6ff78";
      ctx.fillRect(x - 4 * base, y - 46 * base, 8 * base, 4 * base);
      ctx.fillRect(x - 1 * base, y - 50 * base, 2 * base, 4 * base);
    }
    applyDepthOverlay(pig.z, x - 24 * base, y - 54 * base, 50 * base, 52 * base);
  }

  function drawCarrot(carrot) {
    drawShadow(carrot.x, carrot.z, 8, 0.22, 0);
    const bob = Math.sin(carrot.waver) * 6;
    const c = projectToScreen(carrot.x, carrot.z, 10 + bob);
    const s = c.scale;

    ctx.strokeStyle = "#243327";
    ctx.lineWidth = Math.max(1, 1.1 * s);
    ctx.fillStyle = "#4aa83d";
    ctx.fillRect(c.x - 2 * s, c.y - 28 * s, 4 * s, 10 * s);
    ctx.strokeRect(c.x - 2 * s, c.y - 28 * s, 4 * s, 10 * s);
    ctx.fillRect(c.x + 2 * s, c.y - 30 * s, 4 * s, 12 * s);
    ctx.strokeRect(c.x + 2 * s, c.y - 30 * s, 4 * s, 12 * s);
    ctx.fillStyle = "#f08e2f";
    ctx.fillRect(c.x - 7 * s, c.y - 20 * s, 12 * s, 20 * s);
    ctx.strokeRect(c.x - 7 * s, c.y - 20 * s, 12 * s, 20 * s);
    ctx.fillStyle = "#cc6f1d";
    ctx.fillRect(c.x - 3 * s, c.y - 12 * s, 5 * s, 2 * s);
    if (carrot.spawnPulse > 0) {
      ctx.globalAlpha = carrot.spawnPulse / 0.45;
      ctx.strokeStyle = "#9dff84";
      ctx.lineWidth = Math.max(1, 2 * s);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 2 * s, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    applyDepthOverlay(carrot.z, c.x - 8 * s, c.y - 30 * s, 16 * s, 30 * s);
  }

  function drawGrenade(grenade) {
    drawShadow(grenade.x, grenade.z, 7, 0.2, grenade.height);
    const g = projectToScreen(grenade.x, grenade.z, grenade.height);
    const s = g.scale;

    ctx.strokeStyle = "#202c3e";
    ctx.lineWidth = Math.max(1, 1.1 * s);
    ctx.fillStyle = "#343c47";
    ctx.fillRect(g.x - 5 * s, g.y - 5 * s, 10 * s, 10 * s);
    ctx.strokeRect(g.x - 5 * s, g.y - 5 * s, 10 * s, 10 * s);
    ctx.fillStyle = "#8f9aa8";
    ctx.fillRect(g.x - 2 * s, g.y - 8 * s, 4 * s, 3 * s);
    ctx.strokeRect(g.x - 2 * s, g.y - 8 * s, 4 * s, 3 * s);
    ctx.fillStyle = grenade.furyShot ? "#8eff6b" : "#ffd046";
    ctx.fillRect(g.x + 5 * s, g.y - 8 * s, 2 * s, 2 * s);
    applyDepthOverlay(grenade.z, g.x - 6 * s, g.y - 9 * s, 14 * s, 14 * s);
  }

  function drawSplatter(splatter) {
    const life = clamp(1 - splatter.age / splatter.ttl, 0, 1);
    const p = projectToScreen(splatter.x, splatter.z, splatter.height);
    const r = splatter.size * p.scale;

    ctx.globalAlpha = life;
    ctx.fillStyle = splatter.tone;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, r, r * 0.7, splatter.angle, 0, Math.PI * 2);
    ctx.fill();

    if (splatter.height === 0) {
      const g = projectToScreen(splatter.x, splatter.z, 0);
      ctx.globalAlpha = life * 0.45;
      ctx.fillStyle = splatter.tone;
      ctx.beginPath();
      ctx.ellipse(g.x, g.groundY + 2, r * 1.2, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawExplosion(ex) {
    const t = ex.age / ex.ttl;
    const base = projectToScreen(ex.x, ex.z, ex.height * (1 - t));
    const r = (24 + ex.maxRadius * t) * base.scale * 0.47;
    const floor = projectToScreen(ex.x, ex.z, 0);
    const ringR = (20 + ex.maxRadius * t * 0.7) * floor.scale * 0.5;
    const heat = 1 - t;

    ctx.globalAlpha = heat * 0.45;
    ctx.strokeStyle = ex.furyShot ? "#8bff6a" : "#ffe07f";
    ctx.lineWidth = Math.max(1, 3 * floor.scale * (1 - t * 0.4));
    ctx.beginPath();
    ctx.ellipse(floor.x, floor.groundY + 2, ringR, ringR * 0.44, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = ex.furyShot ? (t < 0.45 ? "#b9ff75" : "#65df53") : t < 0.45 ? "#ffdc58" : "#ff8d2f";
    ctx.beginPath();
    ctx.arc(base.x, base.y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ex.furyShot ? "#eaffc9" : "#fff0b6";
    ctx.beginPath();
    ctx.arc(base.x, base.y, r * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawPopup(popup) {
    const life = clamp(1 - popup.age / popup.ttl, 0, 1);
    const offsetY = popup.age * popup.rise;
    const px = projectToScreen(popup.x, popup.z, offsetY);
    const xWobble = Math.sin(popup.wobble) * 4 * life;

    ctx.globalAlpha = life;
    ctx.font = `bold ${popup.size}px monospace`;
    ctx.fillStyle = "rgba(10, 16, 24, 0.7)";
    ctx.fillText(popup.text, px.x - popup.text.length * 4.2 + 1 + xWobble, px.y - 10 + 1);
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, px.x - popup.text.length * 4.2 + xWobble, px.y - 10);
    ctx.globalAlpha = 1;
  }

  function drawHudFrame() {
    ctx.fillStyle = UI_THEME.hud.panelFill;
    ctx.fillRect(12, 12, 346, 132);
    ctx.strokeStyle = UI_THEME.hud.panelStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, 346, 132);
  }

  function drawHudStats(p) {
    ctx.fillStyle = UI_THEME.hud.heading;
    ctx.font = UI_THEME.fonts.small;
    ctx.fillText("SCORE", 22, 28);
    ctx.fillText(`THREAT ${state.level.toString().padStart(2, "0")}`, 198, 76);
    ctx.fillStyle = UI_THEME.hud.score;
    ctx.font = UI_THEME.fonts.score;
    ctx.fillText(state.score.toString().padStart(5, "0"), 22, 54);

    ctx.fillStyle = UI_THEME.hud.text;
    ctx.font = UI_THEME.fonts.body;
    ctx.fillText(`PIGS ${state.killCount.toString().padStart(3, "0")}`, 24, 76);
    ctx.fillText(`WAVE ${state.levelKillCount.toString().padStart(2, "0")}/${state.bossThreshold}`, 24, 92);
    ctx.fillStyle = p.ammo <= 0 ? UI_THEME.hud.caution : UI_THEME.hud.text;
    ctx.fillText(`AMMO ${p.ammo.toString().padStart(2, "0")}`, 24, 108);
  }

  function drawHudBars(p) {
    ctx.fillStyle = UI_THEME.hud.hpBg;
    ctx.fillRect(198, 28, 146, 16);
    ctx.fillStyle = UI_THEME.hud.hpFill;
    ctx.fillRect(199, 29, (p.health / p.maxHealth) * 144, 14);
    ctx.strokeStyle = UI_THEME.hud.hpStroke;
    ctx.strokeRect(198, 28, 146, 16);
    ctx.fillStyle = UI_THEME.hud.hpLabel;
    ctx.font = UI_THEME.fonts.tiny;
    ctx.fillText("NO-CRAP BAR", 198, 24);

    ctx.fillStyle = UI_THEME.hud.furyBg;
    ctx.fillRect(198, 98, 146, 16);
    ctx.fillStyle = state.furyActive
      ? UI_THEME.hud.furyFillActive
      : state.furyMeter >= state.furyMax
        ? UI_THEME.hud.furyFillReady
        : UI_THEME.hud.furyFill;
    const furyPulse = state.furyActive ? 0.25 + Math.sin(state.time * 18) * 0.2 : 0;
    const furyWidth = state.furyActive
      ? (state.furyTimer / 8) * 144
      : (state.furyMeter / state.furyMax) * 144;
    ctx.fillRect(199, 99, furyWidth, 14);
    if (state.furyActive) {
      ctx.fillStyle = `rgba(222, 255, 184, ${furyPulse})`;
      ctx.fillRect(199, 99, furyWidth, 14);
    }
    ctx.strokeStyle = UI_THEME.hud.furyStroke;
    ctx.strokeRect(198, 98, 146, 16);
    ctx.fillStyle = UI_THEME.hud.furyLabel;
    ctx.fillText(state.furyActive ? "FURY ACTIVE" : "CARROT FURY", 198, 124);
  }

  function drawHudDryAmmoPrompt(p) {
    if (p.ammo > 0) {
      return;
    }
    const pulse = 0.32 + Math.sin(state.time * 14) * 0.18;
    ctx.fillStyle = `rgba(255, 110, 110, ${pulse})`;
    ctx.fillRect(20, 120, 162, 18);
    ctx.strokeStyle = UI_THEME.hud.dryStroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 120, 162, 18);
    ctx.fillStyle = UI_THEME.hud.dryText;
    ctx.font = "bold 12px monospace";
    ctx.fillText("OUT - FIRE = SWIPE", 28, 133);
  }

  function drawHudMultiplierBadge() {
    const x = 730;
    const y = 18;
    const w = 214;
    const h = 36;
    ctx.fillStyle = UI_THEME.hud.multFill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(153, 184, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = UI_THEME.hud.multText;
    ctx.font = UI_THEME.fonts.popupBold;
    ctx.fillText(`MULT x${state.comboMult.toFixed(2)}`, x + 12, y + 24);
  }

  function drawHudComboBadge() {
    const x = 730;
    const y = 60;
    const w = 214;
    const h = 36;
    const comboActive = state.combo > 1 && state.comboTimer > 0;
    ctx.fillStyle = comboActive ? UI_THEME.hud.comboFill : UI_THEME.hud.comboIdleFill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = comboActive ? "rgba(255, 225, 143, 0.95)" : "rgba(185, 202, 226, 0.75)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = comboActive ? UI_THEME.hud.comboText : UI_THEME.hud.comboIdleText;
    ctx.font = UI_THEME.fonts.popupBold;
    ctx.fillText(`COMBO x${state.combo.toString().padStart(2, "0")}`, x + 12, y + 24);
  }

  function drawHudBossBar() {
    const boss = getBossPig();
    if (!boss) {
      return;
    }
    const x = 376;
    const y = 18;
    const w = 340;
    const h = 20;
    ctx.fillStyle = "rgba(37, 8, 23, 0.84)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ff4d8f";
    ctx.fillRect(x + 2, y + 2, clamp(boss.hp / boss.maxHp, 0, 1) * (w - 4), h - 4);
    ctx.strokeStyle = "#ffc6e3";
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#ffe8f3";
    ctx.font = UI_THEME.fonts.small;
    ctx.fillText(`BOSS HOG SUPREME P${boss.phase}`, x, y - 4);
  }

  function drawHudBanner() {
    if (state.bossBannerTimer <= 0 && state.furyBannerTimer <= 0) {
      return;
    }
    const alpha = clamp(Math.max(state.bossBannerTimer / 3, state.furyBannerTimer / 2.4), 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = UI_THEME.overlays.bannerFill;
    ctx.fillRect(252, 110, 456, 52);
    ctx.strokeStyle = UI_THEME.overlays.bannerStroke;
    ctx.strokeRect(252, 110, 456, 52);
    const bannerText =
      state.furyBannerTimer > state.bossBannerTimer
        ? state.furyBannerText
        : state.bossBannerText;
    ctx.fillStyle =
      bannerText.indexOf("FURY") >= 0 || state.mode === MODES.UPGRADE
        ? UI_THEME.overlays.bannerFuryText
        : UI_THEME.overlays.bannerText;
    ctx.font = UI_THEME.fonts.header;
    ctx.fillText(bannerText, 268, 144);
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    const p = state.player;
    drawHudFrame();
    drawHudStats(p);
    drawHudBars(p);
    drawHudDryAmmoPrompt(p);
    drawHudMultiplierBadge();
    drawHudComboBadge();
    drawHudBossBar();
    drawHudBanner();
  }

  function drawStartScreen() {
    drawArenaBackground();
    ctx.fillStyle = UI_THEME.menu.panelFill;
    ctx.fillRect(92, 72, 776, 392);
    ctx.strokeStyle = UI_THEME.menu.panelStroke;
    ctx.lineWidth = 4;
    ctx.strokeRect(92, 72, 776, 392);

    ctx.fillStyle = UI_THEME.menu.headerFill;
    ctx.fillRect(110, 90, 740, 70);
    ctx.fillStyle = UI_THEME.menu.logo;
    ctx.font = UI_THEME.fonts.logo;
    ctx.fillText("RABBIT COMMANDO", 228, 136);
    ctx.fillStyle = UI_THEME.menu.subtitle;
    ctx.font = UI_THEME.fonts.mid;
    ctx.fillText("Break bosses. Climb threat levels. Never stop.", 178, 212);

    ctx.fillStyle = UI_THEME.menu.section;
    ctx.font = UI_THEME.fonts.body;
    ctx.fillText("CONTROLS", 142, 250);
    ctx.fillStyle = UI_THEME.menu.text;
    ctx.font = "16px monospace";
    ctx.fillText("MOVE  ARROWS / WASD", 142, 282);
    ctx.fillText("JUMP  SPACE", 142, 310);
    ctx.fillText("FIRE  X / J / CTRL", 142, 338);
    ctx.fillText("AUTO  GRENADE -> SWIPE ON EMPTY", 142, 366);
    ctx.fillText("FURY  C / SHIFT (WHEN FULL)", 142, 394);

    ctx.fillStyle = UI_THEME.menu.section;
    ctx.font = UI_THEME.fonts.body;
    ctx.fillText("ARCADE TIPS", 530, 250);
    ctx.fillStyle = UI_THEME.menu.text;
    ctx.font = "16px monospace";
    ctx.fillText("RICOCHET + AIR KILLS = BIG SCORE", 530, 282);
    ctx.fillText("BOSS CLEAR = 1 UPGRADE PICK", 530, 310);
    ctx.fillText("CARROTS HEAL + CHARGE FURY", 530, 338);
    ctx.fillText("PICK UPGRADE WITH 1 / 2 / 3", 530, 366);

    ctx.fillStyle = UI_THEME.menu.ctaFill;
    ctx.fillRect(214, 408, 532, 42);
    ctx.strokeStyle = UI_THEME.menu.ctaStroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(214, 408, 532, 42);
    ctx.fillStyle = UI_THEME.menu.ctaText;
    ctx.font = UI_THEME.fonts.header;
    ctx.fillText("PRESS ENTER TO START", 274, 437);

    const touchBtn = TOUCH_UI.startButton;
    ctx.fillStyle = "rgba(26, 42, 22, 0.88)";
    ctx.fillRect(touchBtn.x, touchBtn.y, touchBtn.w, touchBtn.h);
    ctx.strokeStyle = "#9ce89f";
    ctx.lineWidth = 2;
    ctx.strokeRect(touchBtn.x, touchBtn.y, touchBtn.w, touchBtn.h);
    ctx.fillStyle = "#d7ffcf";
    ctx.font = "bold 18px monospace";
    ctx.fillText("tap for touch controls", touchBtn.x + 18, touchBtn.y + 23);
  }

  function drawEndScreen(text, subText, accent) {
    ctx.fillStyle = "rgba(5, 8, 16, 0.72)";
    ctx.fillRect(195, 125, 570, 290);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(195, 125, 570, 290);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px monospace";
    ctx.fillText(text, 248, 205);
    ctx.font = "22px monospace";
    ctx.fillText(subText, 244, 255);
    ctx.fillText(`Score ${state.score} | Pigs ${state.killCount}`, 276, 300);
    ctx.fillText("Press R or Enter to run it back", 232, 352);
  }

  function drawUpgradeScreen() {
    ctx.fillStyle = UI_THEME.upgrade.panelFill;
    ctx.fillRect(132, 96, 696, 356);
    ctx.strokeStyle = UI_THEME.upgrade.panelStroke;
    ctx.lineWidth = 3;
    ctx.strokeRect(132, 96, 696, 356);

    ctx.fillStyle = UI_THEME.upgrade.title;
    ctx.font = UI_THEME.fonts.title;
    ctx.fillText(`THREAT ${state.level} CLEARED`, 226, 145);
    ctx.font = UI_THEME.fonts.mid;
    ctx.fillStyle = UI_THEME.upgrade.subtitle;
    ctx.fillText("Pick one upgrade. Next level starts immediately.", 214, 175);

    const cards = state.upgradeChoices;
    for (let i = 0; i < cards.length; i += 1) {
      const card = cards[i];
      const cardX = 164 + i * 218;
      const cardY = 210;
      ctx.fillStyle = UI_THEME.upgrade.cardFill;
      ctx.fillRect(cardX, cardY, 198, 176);
      ctx.strokeStyle = UI_THEME.upgrade.cardStroke;
      ctx.strokeRect(cardX, cardY, 198, 176);
      ctx.fillStyle = UI_THEME.upgrade.cardIndex;
      ctx.font = "bold 20px monospace";
      ctx.fillText(`${i + 1}`, cardX + 12, cardY + 26);
      ctx.fillStyle = UI_THEME.upgrade.cardTitle;
      ctx.font = "bold 18px monospace";
      ctx.fillText(card.label.toUpperCase(), cardX + 12, cardY + 54);
      ctx.fillStyle = UI_THEME.upgrade.cardBody;
      ctx.font = "15px monospace";
      const words = card.desc.split(" ");
      let line = "";
      let row = 0;
      for (const word of words) {
        const next = line.length ? `${line} ${word}` : word;
        if (next.length > 23) {
          ctx.fillText(line, cardX + 12, cardY + 88 + row * 22);
          line = word;
          row += 1;
        } else {
          line = next;
        }
      }
      if (line) {
        ctx.fillText(line, cardX + 12, cardY + 88 + row * 22);
      }
    }

    ctx.fillStyle = UI_THEME.upgrade.footer;
    ctx.font = UI_THEME.fonts.popupBold;
    ctx.fillText("PRESS 1 / 2 / 3 (or ENTER for first pick)", 206, 427);
  }

  function buildWorldDrawables() {
    const drawables = [];
    for (const carrot of state.carrots) {
      drawables.push({ depth: carrot.z + 0.001, draw: () => drawCarrot(carrot) });
    }
    for (const pig of state.pigs) {
      drawables.push({ depth: pig.z + pig.height * 0.0005, draw: () => drawPig(pig) });
    }
    for (const splatter of state.splatters) {
      drawables.push({ depth: splatter.z + splatter.height * 0.0009, draw: () => drawSplatter(splatter) });
    }
    for (const grenade of state.grenades) {
      drawables.push({ depth: grenade.z + grenade.height * 0.0008, draw: () => drawGrenade(grenade) });
    }
    drawables.push({
      depth: state.player.z + state.player.height * 0.0008,
      draw: () => drawRabbit(state.player),
    });
    drawables.sort((a, b) => a.depth - b.depth);
    return drawables;
  }

  function drawWorldScene() {
    drawArenaBackground();
    const drawables = buildWorldDrawables();
    for (const item of drawables) {
      item.draw();
    }
    for (const ex of state.explosions) {
      drawExplosion(ex);
    }
    for (const popup of state.popups) {
      drawPopup(popup);
    }
  }

  function drawBlastFlashOverlay() {
    let blastFlash = 0;
    let furyBlast = false;
    for (const ex of state.explosions) {
      if (ex.age < 0.1) {
        blastFlash = Math.max(blastFlash, 1 - ex.age / 0.1);
        furyBlast = furyBlast || ex.furyShot;
      }
    }
    if (blastFlash <= 0) {
      return;
    }
    ctx.fillStyle = furyBlast
      ? `rgba(190, 255, 148, ${blastFlash * 0.16})`
      : `rgba(255, 243, 198, ${blastFlash * 0.15})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  function drawMeleeFlashOverlay() {
    if (state.player.meleeFlash <= 0) {
      return;
    }
    const flash = state.player.meleeFlash / 0.12;
    const pfx = projectToScreen(state.player.x, state.player.z, state.player.height + 18);
    const face = normalize2(state.player.facingX, state.player.facingZ, 760);
    const sweepRot = Math.atan2(face.z * 2.2, face.x);
    ctx.globalAlpha = flash * 0.5;
    ctx.fillStyle = "#e8fbff";
    ctx.beginPath();
    ctx.ellipse(
      pfx.x + face.x * 60 * pfx.scale,
      pfx.y - 18 * pfx.scale + face.z * 30 * pfx.scale,
      88 * pfx.scale,
      36 * pfx.scale,
      sweepRot,
      -1.6,
      1.45,
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawFuryVignette() {
    if (!state.furyActive) {
      return;
    }
    const vignette = ctx.createRadialGradient(
      VIEW_W * 0.5,
      VIEW_H * 0.5,
      VIEW_H * 0.18,
      VIEW_W * 0.5,
      VIEW_H * 0.5,
      VIEW_H * 0.7,
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, UI_THEME.overlays.vignetteEdge);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  function drawModeOverlay() {
    if (state.mode === MODES.OVER) {
      drawEndScreen("RABBIT DOWN", "Even a hard rabbit needs carrots.", "#ffb33a");
    } else if (state.mode === MODES.UPGRADE) {
      drawUpgradeScreen();
    }
  }

  function render() {
    const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
    const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake : 0;
    ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);

    if (state.mode === MODES.START) {
      drawStartScreen();
      return;
    }

    drawWorldScene();
    drawBlastFlashOverlay();
    drawMeleeFlashOverlay();
    drawHud();
    drawFuryVignette();
    drawModeOverlay();
  }

  function renderGameToText() {
    const p = state.player;
    const boss = getBossPig();
    const payload = {
      mode: state.mode,
      controlScheme: state.controlScheme,
      coordinateSystem:
        "x in arena pixels left-right; z is depth lane (0 far to 1 near); height is jump height above floor in pixels; screen origin top-left",
      arena: {
        xMin: ARENA.minX,
        xMax: ARENA.maxX,
        zMin: ARENA.minZ,
        zMax: ARENA.maxZ,
      },
      player: {
        x: Math.round(p.x),
        z: Number(p.z.toFixed(3)),
        height: Number(p.height.toFixed(2)),
        vx: Number(p.vx.toFixed(2)),
        vz: Number(p.vz.toFixed(3)),
        vy: Number(p.vy.toFixed(2)),
        facingX: p.facingX,
        facingZ: p.facingZ,
        onGround: p.onGround,
        health: p.health,
        maxHealth: p.maxHealth,
        ammo: p.ammo,
        maxAmmo: p.maxAmmo,
        carrotsEaten: p.carrotsEaten,
        upgrades: {
          grenadeDamageMult: Number((p.grenadeDamageMult || 1).toFixed(2)),
          grenadeRadiusMult: Number((p.grenadeRadiusMult || 1).toFixed(2)),
          furyGainMult: Number((p.furyGainMult || 1).toFixed(2)),
          meleeDamageBonus: p.meleeDamageBonus || 0,
          meleeRangeMult: Number((p.meleeRangeMult || 1).toFixed(2)),
        },
        melee: {
          startup: Number(p.meleeStartup.toFixed(3)),
          active: Number(p.meleeActive.toFixed(3)),
          recovery: Number(p.meleeRecovery.toFixed(3)),
          trail: Number(p.meleeTrail.toFixed(3)),
          flash: Number(p.meleeFlash.toFixed(3)),
        },
      },
      pigs: state.pigs.map((pig) => ({
        type: pig.type,
        isBoss: pig.isBoss,
        x: Math.round(pig.x),
        z: Number(pig.z.toFixed(3)),
        height: Number(pig.height.toFixed(2)),
        hp: pig.hp,
        maxHp: pig.maxHp,
        eliteTrait: pig.eliteTrait,
        hopCooldown: Number(pig.hopCooldown.toFixed(2)),
      })),
      carrots: state.carrots.map((carrot) => ({
        x: Math.round(carrot.x),
        z: Number(carrot.z.toFixed(3)),
        ttl: Number(carrot.ttl.toFixed(2)),
      })),
      grenades: state.grenades.map((grenade) => ({
        x: Math.round(grenade.x),
        z: Number(grenade.z.toFixed(3)),
        height: Number(grenade.height.toFixed(2)),
        vx: Number(grenade.vx.toFixed(2)),
        vz: Number(grenade.vz.toFixed(3)),
        vy: Number(grenade.vy.toFixed(2)),
        fuse: Number(grenade.fuse.toFixed(2)),
        bounces: grenade.bounces,
      })),
      explosions: state.explosions.map((ex) => ({
        x: Math.round(ex.x),
        z: Number(ex.z.toFixed(3)),
        age: Number(ex.age.toFixed(2)),
      })),
      splatterCount: state.splatters.length,
      boss: boss
        ? {
            hp: boss.hp,
            maxHp: boss.maxHp,
            x: Math.round(boss.x),
            z: Number(boss.z.toFixed(3)),
            phase: boss.phase,
          }
        : null,
      score: state.score,
      level: state.level,
      killCount: state.killCount,
      levelKillCount: state.levelKillCount,
      bossThreshold: state.bossThreshold,
      difficulty: {
        maxPigs: state.maxPigs,
        pigSpeedMult: Number(state.pigSpeedMult.toFixed(2)),
        pigAggroMult: Number(state.pigAggroMult.toFixed(2)),
        eliteChance: Number(state.eliteChance.toFixed(2)),
        bossPhaseThresholds: state.bossPhaseThresholds,
      },
      combo: state.combo,
      comboMult: Number(state.comboMult.toFixed(2)),
      hitStop: Number(state.hitStop.toFixed(3)),
      fury: {
        meter: Number(state.furyMeter.toFixed(2)),
        max: state.furyMax,
        active: state.furyActive,
        timer: Number(state.furyTimer.toFixed(2)),
      },
      timers: {
        pigSpawn: Number(state.spawnTimer.toFixed(2)),
        carrotSpawn: Number(state.carrotTimer.toFixed(2)),
        meleeCarrotCooldown: Number(state.meleeCarrotCooldown.toFixed(2)),
        bossBanner: Number(state.bossBannerTimer.toFixed(2)),
        furyBanner: Number(state.furyBannerTimer.toFixed(2)),
      },
      upgradeChoices: state.upgradeChoices.map((choice) => ({
        id: choice.id,
        label: choice.label,
      })),
      touch: {
        active: state.touch.active,
        x: Math.round(state.touch.x),
        y: Math.round(state.touch.y),
        autoFireTimer: Number(state.touch.autoFireTimer.toFixed(2)),
      },
    };
    return JSON.stringify(payload);
  }

  window.render_game_to_text = renderGameToText;
  window.advanceTime = (ms) => {
    const frames = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < frames; i += 1) {
      update(1 / 60);
    }
    render();
  };

  let lastTs = performance.now();
  function frame(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  render();
  requestAnimationFrame(frame);
})();
