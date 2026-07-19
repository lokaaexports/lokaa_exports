import mysql from "mysql2/promise";

async function test(){

try {

const conn = await mysql.createConnection({
    host: "srv679.hstgr.io",
    port: 3306,
    user: "u883961038_lokaaexports",
    password: "LokaaDB#2026Secure",
    database: "u883961038_lokaaexports",
    ssl: {}
});

console.log("✅ Connected");

await conn.end();

}catch(err){
console.log(err);
}

}

test();