// Dev overlay for performance monitoring
export function createDebugOverlay(scene) {
  const text = scene.add.text(10, 10, '', {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#00ff00',
    backgroundColor: '#00000088',
    padding: { x: 4, y: 4 },
  }).setScrollFactor(0).setDepth(9999);

  return {
    update(world, enemyCount) {
      const fps = Math.round(scene.game.loop.actualFps);
      text.setText(
        `FPS: ${fps} | Enemies: ${enemyCount} | Elapsed: ${(world.time.elapsed / 1000).toFixed(0)}s`
      );
    },
    destroy() {
      text.destroy();
    },
  };
}
