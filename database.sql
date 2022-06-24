create TABLE users(
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(255),
    email VARCHAR(255),
    phonenumber VARCHAR(255)
);

create TABLE stations(
    id SERIAL PRIMARY KEY,
    time INTEGER,
    battery INTEGER,
    lamp INTEGER,
    user_id INTEGER,
    last_update TIMESTAMP,
    guard BOOLEAN,
    speaker INTEGER,
    secret_key VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE rings(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    time INTEGER,
    sunrise BOOLEAN DEFAULT(true),
    music INTEGER,
    station_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (station_id) REFERENCES stations (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE modules(
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    last_value VARCHAR(255),
    name VARCHAR(255),
    time TIMESTAMP,
    station_id INTEGER,
    user_id INTEGER,
    id_module INTEGER,
    type INTEGER,
    UNIQUE (id_module),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (station_id) REFERENCES stations (id)
);

INSERT INTO stations (time, battery, brightness, user_id, guard, speaker, secret_key) VALUES ('09:09', '...', 0, 70, false, 0, 'jkhjk') RETURNING *