import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const db=new pg.Client({
  user:"postgres",
  password:"1",
  host:"localhost",
  database:"newDataBase",
  port:4000
});

db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisited(){
  const result = await db.query("SELECT country_codes FROM visited_country")
  let countries=[];
  result.rows.forEach((country) => {
    countries.push(country.country_codes);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries=await checkVisited();
  res.render("index.ejs",{countries: countries , total:countries.length});
});

app.post("/add",async (req,res)=>{
  try {
    const countryEntered=req.body.country;
    const result1=await db.query("SELECT country_codes FROM countries WHERE country_name=$1",
                                                                            [countryEntered]);
        const data=result1.rows[0];
        const countryCodes=data.country_codes;  
    try {
        await db.query("INSERT INTO visited_country (country_codes) VALUES ($1)",
                                                                  [countryCodes]);
        res.redirect("/");
      }
     catch (err) {
      const countries=await checkVisited();
      res.render("index.ejs",{
        countries:countries,
        total:countries.length,
        error:"Entered country already added"
      });
  }
}catch (err) {
    const countries=await checkVisited();
      res.render("index.ejs",{
        countries:countries,
        total:countries.length,
        error:"Country name entered does not exist"
      });
    
  }
  
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
