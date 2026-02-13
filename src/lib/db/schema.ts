import {
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const providerEnum = pgEnum("provider_t", ["tcgplayer"]);

export const watchStatusEnum = pgEnum("watch_status_t", [
  "active",
  "paused",
  "archived",
]);

export const alertStateEnum = pgEnum("alert_state_t", [
  "unknown",
  "above_target",
  "below_or_equal_target",
]);

export const alertDeliveryEnum = pgEnum("alert_delivery_t", [
  "sent",
  "failed",
  "suppressed_toggle",
  "suppressed_cooldown",
]);

export const watchItems = pgTable(
  "watch_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    provider: providerEnum("provider").default("tcgplayer").notNull(),
    externalCardId: text("external_card_id").notNull(),
    cardName: text("card_name").notNull(),
    setName: text("set_name"),
    setCode: text("set_code"),
    collectorNumber: text("collector_number"),
    finish: text("finish").default("nonfoil").notNull(),
    condition: text("condition").default("NM").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    targetPrice: numeric("target_price", { precision: 10, scale: 2 }).notNull(),
    currentMarketPrice: numeric("current_market_price", {
      precision: 10,
      scale: 2,
    }),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    alertState: alertStateEnum("alert_state").default("unknown").notNull(),
    lastAlertedAt: timestamp("last_alerted_at", { withTimezone: true }),
    alertCooldownHours: integer("alert_cooldown_hours").default(24).notNull(),
    status: watchStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("watch_items_target_price_gt_zero", sql`${table.targetPrice} > 0`),
    check(
      "watch_items_alert_cooldown_hours_range",
      sql`${table.alertCooldownHours} between 1 and 168`,
    ),
    unique("watch_items_unique_card_variant").on(
      table.userId,
      table.provider,
      table.externalCardId,
      table.finish,
      table.condition,
    ),
    index("watch_items_user_status_idx").on(table.userId, table.status),
    index("watch_items_last_checked_idx").on(table.lastCheckedAt),
  ],
);

export const priceSnapshots = pgTable(
  "price_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    watchItemId: uuid("watch_item_id")
      .notNull()
      .references(() => watchItems.id, { onDelete: "cascade" }),
    observedAt: timestamp("observed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    marketPrice: numeric("market_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    provider: providerEnum("provider").default("tcgplayer").notNull(),
    rawPayload: jsonb("raw_payload").notNull(),
  },
  (table) => [
    index("price_snapshots_watch_item_observed_idx").on(
      table.watchItemId,
      table.observedAt.desc(),
    ),
  ],
);

export const alertEvents = pgTable(
  "alert_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    watchItemId: uuid("watch_item_id")
      .notNull()
      .references(() => watchItems.id, { onDelete: "cascade" }),
    snapshotId: uuid("snapshot_id").references(() => priceSnapshots.id, {
      onDelete: "set null",
    }),
    triggeredAt: timestamp("triggered_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    triggerPrice: numeric("trigger_price", { precision: 10, scale: 2 }).notNull(),
    targetPrice: numeric("target_price", { precision: 10, scale: 2 }).notNull(),
    delivery: alertDeliveryEnum("delivery").notNull(),
    errorMessage: text("error_message"),
  },
  (table) => [
    index("alert_events_watch_item_triggered_idx").on(
      table.watchItemId,
      table.triggeredAt.desc(),
    ),
  ],
);

export const jobRuns = pgTable("job_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobName: text("job_name").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: text("status").notNull(),
  processedCount: integer("processed_count").default(0).notNull(),
  updatedCount: integer("updated_count").default(0).notNull(),
  alertedCount: integer("alerted_count").default(0).notNull(),
  failedCount: integer("failed_count").default(0).notNull(),
  errorSummary: text("error_summary"),
}, (table) => [
  check(
    "job_runs_status_allowed",
    sql`${table.status} in ('running', 'success', 'failed')`,
  ),
]);
