import Express from 'express';
import sqlite3 from 'sqlite3';

const app = Express();

app.use(Express.json());

const db = new sqlite3.Database(
    './data/CardGame.db', (err) => {
        if (err) {
            console.log("Erro ao abrir Banco de Dados" + err.message)
        } else {
            console.log("Conectado com o Banco de Dados")
        }
    }
);

app.post("/card", (req, res, next) => {
    db.run(`INSERT INTO card (name_card,hp,attack,defense,special_attack,special_defense,speed)
        VALUES (?,?,?,?,?,?,?)`,
        [   req.body.name,
            req.body.hp,
            req.body.attack,
            req.body.defense,
            req.body.special_attack,
            req.body.special_defense,
            req.body.speed
        ], function(err, rows){
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            } else {
                res.status(201).json({ "Nova Card ID": this.lastID });
            }
        }
    ); 
});

app.get("/cards", (req, res, next) => {
    db.all(`SELECT * FROM card`, 
        [], function(err, rows){
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(200).json("Banco de dados sem registros");
            }
        }
    );
});

app.get("/card", (req, res, next) => {
    db.all(`SELECT * FROM card WHERE id_card=?`,
        [
            req.body.id_card
        ], function(err, rows){
                console.log(rows)
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(200).json("Card ID "+ req.body.id_card +" Não existe");
            }
        }
    );
});
 
app.put("/card", (req, res, next) => {
    db.run(`UPDATE card SET name_card=?, hp=?, attack=?, defense=?, special_attack=?, special_defense=?, speed=? 
        WHERE id_card=?`,
        [
            req.body.name,
            req.body.hp,
            req.body.attack,
            req.body.defense,
            req.body.special_attack,
            req.body.special_defense,
            req.body.speed,
            req.body.id_card
        ], function(err, rows){
            if(err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows?.length) {
                res.status(200).json("Card ID "+ req.body.id_card +" Não existe");
            } else {
                res.status(201).json("Card ID " + req.body.id_card + " Atualizado");
            }
        }
    );
});

app.delete("/card", (req, res, next) => {
    db.all(`DELETE FROM card WHERE id_card=?`, 
        [
            req.body.id_card
        ], function(err, rows){
            if(err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows?.length) {
                res.status(200).json("Card ID "+ req.body.id_card +" Não existe");
            } else {
                res.status(201).json("Card ID " + req.body.id_card + " Deletado");
            }
        }
    );
});

app.get("/game", (req, res, next) => {
    db.all(`SELECT
        SUM(one.hp + one.attack + one.defense + one.special_attack + one.special_defense + one.speed) as one,
        SUM(two.hp + two.attack + two.defense + two.special_attack + two.special_defense + two.speed) as two
        FROM card AS one, card AS two WHERE one.id_card=? AND two.id_card=?`, 
        [
            req.body.playerOneCard,
            req.body.playerTwoCard
        ], function(err, rows){
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows[0].one > rows[0].two){
                db.run(`INSERT INTO game (playeronecard,playertwocard,winner,loser)
                VALUES (?,?,?,?)`,
                    [
                        req.body.playerOneCard,
                        req.body.playerTwoCard,
                        req.body.playerOneCard,
                        req.body.playerTwoCard
                    ], function(err, rows){
                        if (err) {
                            res.status(400).json({ error: err.message });
                            return;
                        } else {
                            db.all(`SELECT
                            b.winner, b.loser, a.hp, a.attack, a.defense, a.special_attack, a.special_defense, a.speed
                            FROM card AS a
                            JOIN game AS b ON b.winner=a.id_card
                            WHERE b.winner=? AND a.id_card=?
                            GROUP BY id_card`, 
                                [
                                    req.body.playerOneCard,
                                    req.body.playerOneCard
                                ], function(err, rows){
                                    if (err) {
                                        res.status(400).json({ "error": err.message });
                                        return;
                                    } else if (rows.length > 0) {
                                        res.status(200).json(rows);
                                    } else {
                                        res.status(200).json("Jogo não registrado");
                                    }
                                }
                            );
                        }
                    }
                );
            } else if (rows[0].one < rows[0].two){
                db.run(`INSERT INTO game (playeronecard,playertwocard,winner,loser)
                VALUES (?,?,?,?)`,
                    [
                        req.body.playerOneCard,
                        req.body.playerTwoCard,
                        req.body.playerTwoCard,
                        req.body.playerOneCard
                    ], function(err, rows){
                        if (err) {
                            res.status(400).json({ error: err.message });
                            return;
                        } else {
                            db.all(`SELECT
                            b.winner, b.loser, a.hp, a.attack, a.defense, a.special_attack, a.special_defense, a.speed
                            FROM card AS a
                            JOIN game AS b ON b.winner=a.id_card
                            WHERE b.winner=? AND a.id_card=?
                            GROUP BY id_card`, 
                                [
                                    req.body.playerTwoCard,
                                    req.body.playerTwoCard
                                ], function(err, rows){
                                    if (err) {
                                        res.status(400).json({ "error": err.message });
                                        return;
                                    } else if (rows.length > 0) {
                                        res.status(200).json(rows);
                                    } else {
                                        res.status(200).json("Jogo não registrado");
                                    }
                                }
                            );
                        }
                    }
                );
            } else if (rows[0].one === rows[0].two){
                res.status(200).json("Empate");
            } else {
                res.status(200).json("Card não identificada");
            }
        }
    );
});

app.get("/winners", (req, res, next) => {
    db.all(`SELECT
        COUNT(CASE when winner = playeronecard then playeronecard end) as playerOne,
        COUNT(CASE when winner = playertwocard then playertwocard end) As playerTwo
        FROM game`,
        [], function(err, rows){
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(200).json("Card ID "+ req.body.id_card +" Não existe");
            }
        }
    );
});

app.get("/games", (req, res, next) => {
    db.all(`SELECT * FROM game`, 
        [], function(err, rows){
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            } else if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(200).json("Banco de dados sem registros");
            }
        }
    );
});
  
app.listen(3001, () => {
    console.log("Iniciando o Express-JS na porta 3001")
});