import Express from 'express';
import sqlite3 from 'sqlite3';

const app = Express();

app.use(Express.json());

const db = new sqlite3.Database('./data/CardGame.db', (err) => {
    if (err) {
        console.log("Erro ao abrir Banco de Dados" + err.message)
    } else {
        console.log("Conectado com o Banco de Dados")
    }
})

app.post("/card",(req, res, next) => {
    db.run(`INSERT INTO card (name_card,hp,attack,defense,special_attack,special_defense,speed)
            VALUES(?,?,?,?,?,?,?)`,
            [
                req.body.name,
                req.body.hp,
                req.body.attack,
                req.body.defense,
                req.body.special_attack,
                req.body.special_defense,
                req.body.speed,
            ], (err, rows) => {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                } else
                    res.status(201).json({"Card ID": this.lastID});
            }
        ); 
})

app.get("/cards", (req, res, next) => {
    db.all(`SELECT * FROM card`, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        } else
            res.status(200).json(rows);
    });
});

app.get("/card", (req, res, next) => {
    db.all(`SELECT * FROM card WHERE id_card=?`,
            [
                req.body.id_card
            ], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                } else if (rows = undefined || []){
                    res.status(200).json("Card ID "+ req.body.id_card +" Não existe");
                } else 
                    res.status(200).json(rows);
            });
});
 
app.put("/card",(req, res, next) => {
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
            ], (err, rows) => {
                if(err) {
                    res.status(400).json({ "error": err.message });
                    return;
                } else if (rows = undefined || []){
                    res.status(200).json("Card ID " + req.body.id_card + " Não existe");
                } else
                    res.status(201).json("Card ID " + req.body.id_card + " Atualizado");
            }) 
})

app.delete("/card", (req, res, next) => {
    db.all(`DELETE FROM card WHERE id_card=?`, 
            [
                req.body.id_card
            ], (err, rows) => {
                if(err) {
                    res.status(400).json({ "error": err.message })
                    return;
                } else if (rows = undefined || []){
                    res.status(200).json("Card ID " + req.body.id_card + " Não existe");
                } else
                    res.status(200).json("Card ID " + req.body.id_card + " excluida com sucesso");
            })
});

app.get("/game", (req, res, next) => {
    const result = db.all(`SELECT CASE
                            WHEN (SUM(one.hp + one.attack + one.defense + one.special_attack + one.special_defense + one.speed) >
                                SUM(two.hp + two.attack + two.defense + two.special_attack + two.special_defense + two.speed))
                            THEN 1
                            WHEN (SUM(one.hp + one.attack + one.defense + one.special_attack + one.special_defense + one.speed) <
                                SUM(two.hp + two.attack + two.defense + two.special_attack + two.special_defense + two.speed))
                            THEN 2
                            WHEN (SUM(one.hp + one.attack + one.defense + one.special_attack + one.special_defense + one.speed) =
                                SUM(two.hp + two.attack + two.defense + two.special_attack + two.special_defense + two.speed))
                            THEN 3
                            ELSE 0
                            END AS result
                            FROM card AS one, card AS two WHERE one.id_card=? AND two.id_card=?`, 
                            [
                                req.body.playerOneCard,
                                req.body.playerTwoCard
                            ], (err, rows) => {
                                if (err) {
                                    res.status(400).json({ "error": err.message });
                                    return;
                                } else if (rows[0].result === 3){
                                    res.status(200).json("empate");
                                } else if (rows[0].result === 2){
                                    res.status(200).json("Card 2 ganador");
                                } else if (rows[0].result === 1){
                                    res.status(200).json("Card 1ganador");
                                }else
                                    res.status(200).json("Card ID " + req.body.id_card + " Não existe");
                        });
});
  
app.listen(3001, () => {
    console.log("Iniciando o Express-JS na porta 3001")
})