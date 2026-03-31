import { defineComponent, Types } from 'bitecs';

// === Core ===
export const Position = defineComponent({ x: Types.f32, y: Types.f32 });
export const Velocity = defineComponent({ x: Types.f32, y: Types.f32 });
export const Health = defineComponent({ current: Types.f32, max: Types.f32, invulnTimer: Types.f32 });
export const Collider = defineComponent({ radius: Types.f32 });

// === Tags ===
export const Player = defineComponent();
export const Enemy = defineComponent({ typeId: Types.ui8, tier: Types.ui8, damage: Types.f32, speed: Types.f32, xpValue: Types.f32 });
export const Projectile = defineComponent({ damage: Types.f32, speed: Types.f32, piercing: Types.ui8, lifetime: Types.f32 });
export const Pickup = defineComponent({ type: Types.ui8, value: Types.f32 });
export const Dead = defineComponent();

// === Combat ===
export const Attack = defineComponent({ damage: Types.f32, cooldown: Types.f32, timer: Types.f32, range: Types.f32 });
export const Weapon = defineComponent({ id: Types.ui8, level: Types.ui8, pattern: Types.ui8 });

// Pickup types
export const PICKUP_XP = 0;
export const PICKUP_HEAL = 1;
