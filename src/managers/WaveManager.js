export class WaveManager {
  constructor(wavesData) {
    this.waves = wavesData || [];
    this.currentWaveIndex = 0;
    this.spawnTimers = new Map(); // enemyType -> accumulated time
  }

  getCurrentWave(elapsedMs) {
    const elapsedSec = elapsedMs / 1000;
    // Find the latest wave that has started
    let wave = this.waves[0];
    for (let i = 0; i < this.waves.length; i++) {
      if (this.waves[i].time <= elapsedSec) {
        wave = this.waves[i];
        this.currentWaveIndex = i;
      } else {
        break;
      }
    }
    return wave;
  }

  getSpawns(elapsedMs, delta) {
    const wave = this.getCurrentWave(elapsedMs);
    if (!wave || !wave.enemies) return [];

    const spawns = [];
    const deltaSec = delta / 1000;

    for (const entry of wave.enemies) {
      const key = entry.type;
      const accumulated = (this.spawnTimers.get(key) || 0) + deltaSec * entry.rate;
      const count = Math.floor(accumulated);
      this.spawnTimers.set(key, accumulated - count);

      for (let i = 0; i < count; i++) {
        spawns.push(entry.type);
      }
    }

    return spawns;
  }
}
