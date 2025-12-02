DROP DATABASE IF EXISTS dashstar_db;
CREATE DATABASE dashstar_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE dashstar_db;


CREATE TABLE Users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','user') NOT NULL,
    full_name VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    country VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    timezone VARCHAR(100) NULL,
    level INT UNSIGNED NOT NULL DEFAULT 1,
    xp INT UNSIGNED NOT NULL DEFAULT 0,
    numTasksCompleted  INT UNSIGNED NOT NULL DEFAULT 0,
    theme VARCHAR(50)  NULL DEFAULT 'dark',
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE Workspaces (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL DEFAULT 'Workspace',
    code VARCHAR(64) NOT NULL UNIQUE,         
    admin_user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_workspace_admin FOREIGN KEY (admin_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE UserWorkspace (
    user_id INT UNSIGNED NOT NULL,
    workspace_id INT UNSIGNED NOT NULL,
    role ENUM('admin','member') NOT NULL DEFAULT 'member',
    PRIMARY KEY (user_id, workspace_id),
    CONSTRAINT fk_uw_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uw_workspace FOREIGN KEY (workspace_id) REFERENCES Workspaces(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Teams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    admin_user_id INT UNSIGNED NOT NULL,                     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_name_per_workspace UNIQUE (workspace_id, name),
    CONSTRAINT fk_team_workspace FOREIGN KEY (workspace_id)
        REFERENCES Workspaces(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_admin FOREIGN KEY (admin_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE TeamMembers (
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT fk_tm_team FOREIGN KEY (team_id)
        REFERENCES Teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_tm_user FOREIGN KEY (user_id)
        REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    created_by_user_id INT UNSIGNED NOT NULL,                
    task_name VARCHAR(150) NOT NULL,
    task_desc TEXT NULL,
    difficulty ENUM('easy','medium','hard','insane') NOT NULL DEFAULT 'easy',
    date_due TIMESTAMP NULL,
    status ENUM('open','inprogress','complete','archived') NOT NULL DEFAULT 'open',
    assigned_to_user_id INT UNSIGNED NULL,
    assigned_to_username VARCHAR(150) NULL,
    completed_by_user_id INT UNSIGNED NULL,
    completed_by_username VARCHAR(150) NULL,
    task_xp INT UNSIGNED NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_task_team FOREIGN KEY (team_id)
        REFERENCES Teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_creator FOREIGN KEY (created_by_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE Schedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id INT UNSIGNED NOT NULL,
    created_by_user_id INT UNSIGNED NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NULL,
    status ENUM('planned','active','complete','cancelled') NOT NULL DEFAULT 'planned',
    message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_team FOREIGN KEY (team_id)
        REFERENCES Teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_creator FOREIGN KEY (created_by_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE Messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id INT UNSIGNED NULL,
    team_id INT UNSIGNED NULL,
    workspace_id INT UNSIGNED NULL,
    sender_user_id INT UNSIGNED NOT NULL,
    recipient_user_id INT UNSIGNED NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_task FOREIGN KEY (task_id)
        REFERENCES Tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_team FOREIGN KEY (team_id)
        REFERENCES Teams(id) ON DELETE SET NULL,
    CONSTRAINT fk_message_workspace FOREIGN KEY (workspace_id)
        REFERENCES Workspaces(id) ON DELETE SET NULL,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_message_recipient FOREIGN KEY (recipient_user_id)
        REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE TaskCollaborators (
    task_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    invited_by_user_id INT UNSIGNED NULL,
    status ENUM('invited','accepted','declined') NOT NULL DEFAULT 'accepted',
    role ENUM('participant','admin') NOT NULL DEFAULT 'participant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id),
    CONSTRAINT fk_tc_task FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_inviter FOREIGN KEY (invited_by_user_id) REFERENCES Users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE Achievements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE UserAchievements (
    user_id INT UNSIGNED NOT NULL,
    achievement_id INT UNSIGNED NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    CONSTRAINT fk_ua_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ua_achievement FOREIGN KEY (achievement_id) REFERENCES Achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE UserBlocks (
    user_id INT UNSIGNED NOT NULL,
    blocked_user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, blocked_user_id),
    CONSTRAINT fk_block_user FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_block_blocked FOREIGN KEY (blocked_user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

