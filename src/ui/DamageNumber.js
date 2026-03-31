// Floating damage numbers
export function createDamageNumberManager(scene) {
  const pool = [];
  const active = [];

  function spawn(x, y, value, color = '#ffffff') {
    let text;
    if (pool.length > 0) {
      text = pool.pop();
      text.setActive(true).setVisible(true);
    } else {
      text = scene.add.text(0, 0, '', {
        fontSize: '14px', fontFamily: 'monospace',
        stroke: '#000000', strokeThickness: 2,
      }).setDepth(150);
    }

    text.setText(String(Math.round(value)));
    text.setColor(color);
    text.setPosition(x, y);
    text.setAlpha(1);
    active.push({ text, life: 0, maxLife: 600 });
  }

  function update(delta) {
    for (let i = active.length - 1; i >= 0; i--) {
      const d = active[i];
      d.life += delta;
      const t = d.life / d.maxLife;
      d.text.y -= delta * 0.05;
      d.text.setAlpha(1 - t);
      if (d.life >= d.maxLife) {
        d.text.setActive(false).setVisible(false);
        pool.push(d.text);
        active.splice(i, 1);
      }
    }
  }

  function destroyAll() {
    for (const d of active) d.text.destroy();
    for (const t of pool) t.destroy();
    active.length = 0;
    pool.length = 0;
  }

  return { spawn, update, destroyAll };
}
