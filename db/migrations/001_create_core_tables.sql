CREATE DATABASE IF NOT EXISTS dashstar_db;
USE dashstar_db;

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  manager_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  phone VARCHAR(50) NULL,
  country VARCHAR(100) NULL,
  city VARCHAR(100) NULL,
  timezone VARCHAR(100) NULL DEFAULT 'UTC',
  theme VARCHAR(50) NULL DEFAULT 'light',
  avatar_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  team_id INT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  status ENUM('open','published','inprogress','complete') NOT NULL DEFAULT 'open',
  xp_reward INT NOT NULL DEFAULT 10,
  due_date DATETIME NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_tasks_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('assigned','in_progress','completed') NOT NULL DEFAULT 'assigned',
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignment_task FOREIGN KEY (task_id) REFERENCES tasks(id),
  CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uniq_assignment UNIQUE (task_id, user_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(id),
  CONSTRAINT uniq_user_badge UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NULL,
  delta INT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_xp_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_xp_task FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NULL,
  status ENUM('planned','active','completed','cancelled') NOT NULL DEFAULT 'planned',
  target_team_id INT NULL,
  target_user_id INT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_team FOREIGN KEY (target_team_id) REFERENCES teams(id),
  CONSTRAINT fk_schedule_user FOREIGN KEY (target_user_id) REFERENCES users(id),
  CONSTRAINT fk_schedule_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  sender_id INT NOT NULL,
  recipient_user_id INT NULL,
  recipient_team_id INT NULL,
  subject VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('draft','sent') NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_messages_recipient_user FOREIGN KEY (recipient_user_id) REFERENCES users(id),
  CONSTRAINT fk_messages_recipient_team FOREIGN KEY (recipient_team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  owner_user_id INT NOT NULL,
  join_code VARCHAR(64) NULL,
  join_code_expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_workspaces_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workspace_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner','admin','member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_workspace_users_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  CONSTRAINT fk_workspace_users_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT uniq_workspace_user UNIQUE (workspace_id, user_id)
);

ALTER TABLE teams
  ADD CONSTRAINT fk_teams_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE teams
  ADD CONSTRAINT uniq_team_workspace UNIQUE (workspace_id, name);

ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);
ALTER TABLE tasks
  ADD CONSTRAINT fk_tasks_team FOREIGN KEY (team_id) REFERENCES teams(id);
ALTER TABLE tasks
  ADD INDEX idx_tasks_workspace_team (workspace_id, team_id);

ALTER TABLE schedules
  ADD CONSTRAINT fk_schedules_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE messages
  ADD CONSTRAINT fk_messages_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE workspaces
  ADD UNIQUE INDEX uniq_workspaces_join_code (join_code);
