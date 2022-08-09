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
            ],
            function (err, result) {
                if (err) {
                res.status(400).json({ error: err.message });
                return;
                }
                res.status(201).json({
                "Card ID": this.lastID,
                });
            }
        ); 
})

app.get("/cards", (req, res, next) => {
    db.all(`SELECT * FROM card`, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
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
                } else if (rows.length > 0){
                res.status(200).json(rows);
                } else 
                res.status(200).json("Card "+ req.body.id_card +" nao existe");
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
            ],
            function(err, result){
                if(err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
                res.status(201).json("Card ID: " + req.body.id_card + " Atualizado")
            }) 
})

app.delete("/card", (req, res, next) => {
    db.all(`DELETE FROM card WHERE id_card=?`, 
            [
                req.body.id_card
            ],
            function(err, rows){
                if(err) {
                    res.status(400).json({ "error": err.message })
                    return;
                } else if (rows.length < 1){
                    res.status(200).json("Card " + req.body.id_card + " Nao existe")
                } else
                    res.status(200).json("Card " + req.body.id_card + " excluida com sucesso")})
});
  
app.listen(3001, () => {
    console.log("Iniciando o Express-JS na porta 3001")
})