const express = require("express");
const { google } = require("googleapis");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('NotSoSecret'));
app.use(session({
  secret : 'something',
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.get("/", (req, res) => {
  const name = req.flash('user');
  res.render("index", {name} );
});
app.use('/public', express.static('public'));


app.post("/", async (req, res) => {
  try{
    console.log("you made request");
    console.log(req.body);
    const { name ,email  } = req.body;
    console.log(name);
    // if(!name){
    //   // res.status(500).send("Name Cannot be empty")
    //   throw{
    //     statusCode:500,message:"Name Cannot be empty"
    //   }
    // }

    // if(!email){
    //   throw{
    //     statusCode:500,message:"Email Cannot be empty"
    //   }
    // }
  
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
  
    // Create client instance for auth
    const client = await auth.getClient();
  
    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });
  
    const spreadsheetId = "1cpvgKXm04svVtusSNMFR8gHFurgKkp82gwf-aPHvRQ4";
  
    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });
  
    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Sheet1!A:A",
    });
  
    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1!A:B",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[ name ,email]],
      },
    });
  
    // res.send("Successfully submitted! Thank you!");
    req.flash('user', req.body.name);
    res.redirect('/');
  }catch(err){
console.log(err);
res.status(err.statusCode).json(err.message);
  }
  
});


app.listen(1337, (req, res) => console.log("running on 1337"));