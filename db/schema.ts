import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const profiles=sqliteTable('profiles',{
 userId:text('user_id').primaryKey(), coins:integer('coins').notNull().default(0),
 speed:integer('speed').notNull().default(0),health:integer('health').notNull().default(0),
 damage:integer('damage').notNull().default(0),pickup:integer('pickup').notNull().default(0),
 throneRoom:integer('throne_room').notNull().default(0),keepKey:integer('keep_key').notNull().default(0),firstFloor:integer('first_floor').notNull().default(0),
 createdAt:integer('created_at').notNull()
});
export const runs=sqliteTable('runs',{
 id:text('id').primaryKey(),userId:text('user_id').notNull().references(()=>profiles.userId),
 mastery:integer('mastery').notNull().default(0),transforms:integer('transforms').notNull().default(0),
 mapId:text('map_id').notNull().default('courtyard'),seals:integer('seals').notNull().default(0),charted:integer('charted').notNull().default(0),
 kingDefeated:integer('king_defeated').notNull().default(0),claims:integer('claims').notNull().default(0),gold:integer('gold').notNull().default(0),elapsed:integer('elapsed').notNull().default(0),
 kills:integer('kills').notNull().default(0),closed:integer('closed').notNull().default(0),
 victory:integer('victory').notNull().default(0),bonuses:text('bonuses').notNull(),
 startedAt:integer('started_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[index('runs_user_id_idx').on(t.userId)]);

export const coopRooms=sqliteTable('coop_rooms',{
 code:text('code').primaryKey(),hostToken:text('host_token').notNull(),guestToken:text('guest_token'),
 mapId:text('map_id').notNull(),hostConfig:text('host_config').notNull(),guestConfig:text('guest_config'),
 state:text('state'),input:text('input'),hostSignal:text('host_signal'),guestSignal:text('guest_signal'),
 hostSeq:integer('host_seq').notNull().default(0),guestSeq:integer('guest_seq').notNull().default(0),
 hostSeen:integer('host_seen').notNull(),guestSeen:integer('guest_seen').notNull().default(0),
 expiresAt:integer('expires_at').notNull(),closed:integer('closed').notNull().default(0)
},t=>[index('coop_rooms_expiry_idx').on(t.expiresAt)]);

export const layoutDrafts=sqliteTable('layout_drafts',{
 mapId:text('map_id').primaryKey(),revision:integer('revision').notNull().default(0),patches:text('patches').notNull().default('[]'),updatedAt:integer('updated_at').notNull()
});
export const layoutVersions=sqliteTable('layout_versions',{
 id:integer('id').primaryKey({autoIncrement:true}),bundle:text('bundle').notNull(),createdAt:integer('created_at').notNull()
});
