CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `picture` varchar(255),
  `age` integer,
  `country` varchar(255),
  `city` varchar(255),
  `sexe` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `films` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `poster` varchar(255) COMMENT 'URL de l''affiche',
  `genre` varchar(255),
  `director` varchar(255),
  `release_date` date,
  `duration` integer COMMENT 'durée en minutes',
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `comments` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `likes` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `type` varchar(255) NOT NULL COMMENT 'like ou dislike',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `watchlist` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `watched` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `rating` integer COMMENT 'note de 1 à 10',
  `watched_at` date,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `followers` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `follower_id` integer NOT NULL,
  `following_id` integer NOT NULL,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `reviews` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `rating` integer COMMENT 'note de 1 à 10',
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `lists` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_public` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `list_films` (
  `list_id` integer NOT NULL,
  `film_id` integer NOT NULL,
  `position` integer COMMENT 'ordre dans la liste',
  PRIMARY KEY (`list_id`, `film_id`)
);

CREATE UNIQUE INDEX `likes_index_0` ON `likes` (`user_id`, `film_id`);

CREATE UNIQUE INDEX `watchlist_index_1` ON `watchlist` (`user_id`, `film_id`);

CREATE UNIQUE INDEX `watched_index_2` ON `watched` (`user_id`, `film_id`);

CREATE UNIQUE INDEX `followers_index_3` ON `followers` (`follower_id`, `following_id`);

CREATE UNIQUE INDEX `reviews_index_4` ON `reviews` (`user_id`, `film_id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `comments` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);

ALTER TABLE `likes` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `likes` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);

ALTER TABLE `watchlist` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `watchlist` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);

ALTER TABLE `watched` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `watched` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);

ALTER TABLE `followers` ADD FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`);

ALTER TABLE `followers` ADD FOREIGN KEY (`following_id`) REFERENCES `users` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);

ALTER TABLE `lists` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `list_films` ADD FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`);

ALTER TABLE `list_films` ADD FOREIGN KEY (`film_id`) REFERENCES `films` (`id`);
