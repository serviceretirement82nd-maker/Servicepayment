const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json())
app.use(express.static("public"))

const db = new sqlite3.Database("database.db")

db.serialize(() => {

db.run(`CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY,
service_number TEXT,
password TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS payments(
id INTEGER PRIMARY KEY,
user_id INTEGER,
txid TEXT,
status TEXT
)`)

})

app.post("/login",(req,res)=>{

const {service_number,password}=req.body

db.get(
"SELECT * FROM users WHERE service_number=? AND password=?",
[service_number,password],
(err,row)=>{

if(row){
res.json({success:true,user:row})
}else{
res.json({success:false})
}

})

})

app.post("/submit-payment",(req,res)=>{

const {user_id,txid}=req.body

db.run(
"INSERT INTO payments(user_id,txid,status) VALUES(?,?,?)",
[user_id,txid,"pending"]
)

res.json({message:"Payment submitted"})
})

app.get("/payments",(req,res)=>{

db.all("SELECT * FROM payments",(err,rows)=>{
res.json(rows)
})

})

app.post("/confirm-payment",(req,res)=>{

const {payment_id}=req.body

const tx="TX-"+Date.now()

db.run(
"UPDATE payments SET status='confirmed' WHERE id=?",
[payment_id]
)

res.json({transaction:tx})

})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})
