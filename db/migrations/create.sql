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
    date_due TIMESTAMP NULL,
    status ENUM('open','inprogress','complete') NOT NULL DEFAULT 'open',
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
    team_id INT UNSIGNED NOT NULL,
    created_by_user_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_team FOREIGN KEY (team_id)
        REFERENCES Teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_creator FOREIGN KEY (created_by_user_id)
        REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

