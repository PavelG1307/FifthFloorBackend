create TABLE users(
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(255) DEFAULT("ADMIN")
);

create TABLE stations(
    id SERIAL PRIMARY KEY,
    time VARCHAR(255),
    voltage VARCHAR(255),
    brightness INTEGER,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE rings(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    time INTEGER,
    sunrise BOOLEAN DEFAULT(true),
    music INTEGER,
    stations_id INTEGER,
    FOREIGN KEY (stations_id) REFERENCES stations (id)
);

create TABLE sensors(
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    last_value VARCHAR(255),
    time INTEGER,
    stations_id INTEGER,
    FOREIGN KEY (stations_id) REFERENCES stations (id)
);