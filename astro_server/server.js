const express = require('express');
const schedule = require('node-schedule');
const { Pool } = require('pg');

var https = require('follow-redirects').https;

const path = require('path');

const PORT = process.env.PORT || 8080;
const app = express();

const credentials = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
}

if(process.env.NODE_ENV === "production") {
    app.use(express.static('../astro_client/build'));
    app.use(express.json());
    app.get('*', (req, res) => {
        req.sendFile(path.resolve('astro_client/build/index.html', { root: "../" }));
    });
}

app.post("/post", async (req, res) => {
    console.log(req.body.name);
    
    const queryRes = await searchFromQuery(req.body.name);

    res.json({
        status: queryRes.isFound ? "found" : "notFound", teaminfo: {
            name: queryRes.name,
            number: queryRes.number,
            avgScore: queryRes.avgScore,
            predictedScore: queryRes.predictedScore,
        }
    });
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));

app.get("/", function(req, res) {
    res.sendFile('astro_client/build/index.html', { root: "../" });
});

// DATABASE FUNCTIONS
async function searchFromQuery(number) {
    /*

    team num query => team table [if not found, return immediately]

    search for occurences of team num in MATCHES table

    return json obj with team name, number, avg score, every match score (chrono order), and predicted score

    {
        name: "name",
        number: 19819,
        avgScore: 200,
        scores: [100, 200, 250],
        predictedScore: 300
    }

    */

    var num = Number(number);
    const pool = new Pool(credentials);
    const text = `SELECT * FROM public."participatingTeams" WHERE teamnumber = $1`;
    const values = [num];

    const now = await pool.query(text, values);
    

    if (now.rows.length == 0) {
        return {
            isFound: false,
            name: "--",
            number: -1,
            avgScore: -1,
            predictedScore: -1
        }
    }

    const later = await pool.query(`SELECT * FROM public.matches WHERE ${num}=ANY(blueteams) OR ${num}=ANY(redteams)`);

    await pool.end();
    var avg = 0;
    var sum = 0;

    if(later.rows.length > 0)
    {
        const isRed = later.rows[0].redteams.includes(num);
        for(var row of later.rows)
        {
            if(isRed) {
                sum += Number(row.redscore);
            }
            else {
                sum += Number(row.bluescore);
            }
        }
    }

    console.log(sum);

    avg = Math.round(sum / later.rows.length);

    return {
        isFound: true,
        name: now.rows[0].name,
        number: now.rows[0].teamnumber,
        avgScore: avg,
        predictedScore: 31
    }
}

// API FUNCTIONS
schedule.scheduleJob('0 0 * * *', async () => {
    // update db from FTC teams API

    /*
    TEAMS
    name | number

    EVENTS
    dbid | apitag | date

    MATCHES
    matchid | bluescore | redscore | blueteamnumbers | redteamnumbers

    */

    // clear MATCHES and TEAMS table
    console.log("Clearing matches and participatingTeams tables...");
    const pool = new Pool(credentials);

    const matchDelReq = pool.query(`DELETE FROM public.matches`);
    console.log(matchDelReq);

    const teamDelReq = pool.query(`DELETE FROM public."participatingTeams"`);
    console.log(teamDelReq);

    // get all teams & save to TEAMS table
    getTeams();

    // get all events
    // use events to find all matches, save score and participating teams
    newMatchGet();
});

async function getTeams() {
    var curPage = 1;
    var maxPage = 2;

    console.log("Updating Team Database...");
    var start = Date.now();

    const pool = new Pool(credentials);
    const text = `INSERT INTO public."participatingTeams"(teamnumber, name) VALUES ($1, $2)`;

    while (curPage < maxPage) {
        const body = await callFTCAPI(`/v2.0/2021/teams?page=${curPage + 1}`);
        curPage = body.pageCurrent;
        maxPage = body.pageTotal;

        body.teams.forEach(async (team) => {
            var values = [team.teamNumber, team.nameShort];
            const now = await pool.query(text, values);
            process.stdout.write(`Added team ${team.teamNumber}, ${team.nameShort}`);
        });
    }

    console.log("Database updated in " + (Date.now() - start) + " milliseconds");
    await pool.end();
}

async function newMatchGet() {
    const eventList = await callFTCAPI(`/v2.0/2021/events`);
    const pool = new Pool(credentials);

    var matchQuery = await pool.query(`SELECT MAX(id) as max_id FROM public.matches`);
    var curId = matchQuery.rows[0].max_id == null ? matchQuery.rows[0].max_id : 0;

    console.log("Updating Match DB...");
    var start = Date.now();

    for (const event of eventList.events) {
        if (event.published) {
            process.stdout.write(`Current event ID: ${curId}\r`);
            var val = event.code;
            var text = `/v2.0/2021/matches/${val}`;

            const eventBody = await callFTCAPI(text).catch((err) => { console.log("Error with " + val + ", " + err.message); });

            for (const match of eventBody.matches) {
                curId++;

                var redTeam = [0, 0];
                var blueTeam = [0, 0];

                match.teams.forEach((team) => {
                    if (team.station.charAt(0) === 'r' || team.station.charAt(0) === 'R') {
                        redTeam.splice(0, 0, team.teamNumber);
                    }
                    else {
                        blueTeam.splice(0, 0, team.teamNumber);
                    }
                });


                var values = [curId, match.scoreBlueFinal, match.scoreRedFinal, match.actualStartTime, Number(redTeam[0]), Number(redTeam[1]), Number(blueTeam[0]), Number(blueTeam[1])];
                var dbText = `INSERT INTO public.matches VALUES ($1, $2, $3, $4, ARRAY [CAST ($5 as numeric), CAST ($6 as numeric)], ARRAY [CAST ($7 as numeric), CAST ($8 as numeric)])`;

                const req = await pool.query(dbText, values);
            }
        }
    }

    console.log("finished in " + (Date.now() - start) + " ms");
    await pool.end();
}

function callFTCAPI(path) {
    var options = {
        'method': 'GET',
        'hostname': 'ftc-api.firstinspires.org',
        'path': path,
        'headers': {
            'Authorization': 'Basic anpmbGludDpBQTE3MkQ3OS05RDYyLTQ4REUtOEMwQi03Q0Q4OUE4QkREQkM='
        },
        'maxRedirects': 20
    };

    return new Promise((resolve, reject) => {
        var req = https.request(options, function (res) {
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                var body = Buffer.concat(chunks);
                //console.log(body.toString());
                if (res.statusCode != 200) {
                    reject({ message: "request failed with error code " + res.statusCode + " and " + path });
                }
                else {
                    resolve(JSON.parse(body));
                }
            });

            res.on("error", function (error) {
                reject({ message: "request failed with error code " + res.statusCode + " and " + path });
            });
        });

        req.end();
    })
}