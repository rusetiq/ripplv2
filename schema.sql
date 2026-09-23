-- Rippl schema. Everything the client used to write directly to Firestore now
-- lives here behind the Worker API, which is the only writer.

CREATE TABLE users (
  uid              TEXT PRIMARY KEY,
  -- Private. Never included in any payload except the owner's own /api/me.
  email            TEXT    NOT NULL DEFAULT '',
  display_name     TEXT    NOT NULL DEFAULT '',
  location         TEXT    NOT NULL DEFAULT '',
  -- photo_key wins when set (an R2 object); photo_url is the Google avatar.
  photo_key        TEXT,
  photo_url        TEXT    NOT NULL DEFAULT '',
  points           INTEGER NOT NULL DEFAULT 0,
  co2_saved        REAL    NOT NULL DEFAULT 0,
  water_saved      REAL    NOT NULL DEFAULT 0,
  streak           INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT    NOT NULL DEFAULT '',
  is_admin         INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL
);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email <> '';

-- Posts carry no denormalised name or avatar: those are joined from users at
-- read time, so a client can no longer post under someone else's identity.
CREATE TABLE posts (
  id             TEXT PRIMARY KEY,
  user_id        TEXT    NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  category       TEXT    NOT NULL DEFAULT '',
  action         TEXT    NOT NULL,
  impact         TEXT    NOT NULL DEFAULT '',
  points         INTEGER NOT NULL DEFAULT 0,
  image_key      TEXT,
  likes_count    INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL
);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);

CREATE TABLE post_likes (
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE comments (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_comments_post ON comments(post_id, created_at ASC);

CREATE TABLE user_actions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT    NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  action_id  TEXT    NOT NULL,
  category   TEXT    NOT NULL,
  label      TEXT    NOT NULL,
  points     INTEGER NOT NULL DEFAULT 0,
  co2        REAL    NOT NULL DEFAULT 0,
  water      REAL    NOT NULL DEFAULT 0,
  image_key  TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_actions_user_time ON user_actions(user_id, created_at DESC);

CREATE TABLE badges (
  user_id    TEXT    NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  badge_id   TEXT    NOT NULL,
  unlocked   INTEGER NOT NULL DEFAULT 0,
  progress   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE redemptions (
  user_id    TEXT    NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  reward_id  TEXT    NOT NULL,
  cost       INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, reward_id)
);

CREATE TABLE sponsored_rewards (
  id         TEXT PRIMARY KEY,
  name       TEXT    NOT NULL,
  subtitle   TEXT    NOT NULL DEFAULT '',
  href       TEXT    NOT NULL,
  image_url  TEXT    NOT NULL DEFAULT '',
  points     INTEGER NOT NULL DEFAULT 0,
  badge      TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_sponsored_order ON sponsored_rewards(sort_order ASC);

-- Rate limiting for the expensive paths (photo verification, post creation).
CREATE TABLE rate_limits (
  user_id    TEXT    NOT NULL,
  bucket     TEXT    NOT NULL,
  window_start INTEGER NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket)
);
