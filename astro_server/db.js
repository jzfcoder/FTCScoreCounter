const { Pool } = require('pg');
var https = require('follow-redirects').https;
require('dotenv').config();

const credentials = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
}

updateDB();

async function updateDB() {
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

    const matchDelReq = await pool.query(`DELETE FROM public.matches`);
    console.log(matchDelReq);

    const teamDelReq = await pool.query(`DELETE FROM public."participatingTeams"`);
    console.log(teamDelReq);

    // get all teams & save to TEAMS table
    getTeams();

    // get all events
    // use events to find all matches, save score and participating teams
    newMatchGet();
}

async function getTeams() {
    var curPage = 0;
    var maxPage = 2;

    console.log("Updating Team Database...");
    var start = Date.now();

    const pool = new Pool(credentials);

    const text = `INSERT INTO public."participatingTeams"(teamnumber, name) VALUES ($1, $2)`;

    while (curPage < maxPage) {
        const body = await callFTCAPI(`/v2.0/2022/teams?page=${curPage + 1}`);
        curPage = body.pageCurrent;
        maxPage = body.pageTotal;

        for (var team of body.teams) {
            var values = [team.teamNumber, team.nameShort];

            if (!team.teamNumber || !team.nameShort) { console.log("team: " + team); }
            else {
                const now = await pool.query(text, values);
            }
        }
    }

    console.log("Finished teams in " + (Date.now() - start) + " ms");
    await pool.end();
}

async function newMatchGet() {
    const eventList = await callFTCAPI(`/v2.0/2022/events`);
    const pool = new Pool(credentials);

    var matchQuery = await pool.query(`SELECT MAX(id) as max_id FROM public.matches`);
    var curId = matchQuery.rows[0].max_id == null ? 0 : matchQuery.rows[0].max_id;

    console.log("Updating Match DB...");
    var start = Date.now();

    for (const event of eventList.events) {
        if (event.published) {
            var val = event.code;
            var text = `/v2.0/2022/matches/${val}`;

            const eventBody = await callFTCAPI(text).catch((err) => { console.log("Error with " + val + ", " + err.message); });

            for (const match of eventBody.matches) {
                curId++;

                var redTeam = [0, 0];
                var blueTeam = [0, 0];

                if (match.teams.length === 1) {
                    if (match.scoreRedFinal > 0 && match.scoreBlueFinal <= 0) {
                        redTeam.splice(0, 0, match.teams[0].teamNumber);
                    }
                    else if (match.scoreBlueFinal > 0 && match.scoreRedFinal <= 0) {
                        blueTeam.splice(0, 0, match.teams[0].teamNumber);
                    }
                }
                else if (match.teams.length === 2 && match.teams[0].station.charAt[0] === match.teams[1].station.charAt[0]) {
                    if (match.scoreRedFinal > 0 && match.scoreBlueFinal <= 0) {
                        redTeam.splice(0, 0, match.teams[0].teamNumber);
                        redTeam.splice(0, 0, match.teams[1].teamNumber);
                    }
                    else if (match.scoreBlueFinal > 0 && match.scoreRedFinal <= 0) {
                        blueTeam.splice(0, 0, match.teams[0].teamNumber);
                        blueTeam.splice(0, 0, match.teams[1].teamNumber);
                    }
                }
                else {
                    match.teams.forEach((team) => {
                        if (team.station.charAt(0) === 'r' || team.station.charAt(0) === 'R') {
                            redTeam.splice(0, 0, team.teamNumber);
                        }
                        if (team.station.charAt(0) === 'b' || team.station.charAt(0) === 'B') {
                            blueTeam.splice(0, 0, team.teamNumber);
                        }
                    });
                }

                //            1      2                     3                    4                      5                   6                   7                    8   
                var values = [curId, match.scoreBlueFinal, match.scoreRedFinal, match.actualStartTime, Number(redTeam[0]), Number(redTeam[1]), Number(blueTeam[0]), Number(blueTeam[1])];
                var dbText = `INSERT INTO public.matches VALUES ($1, $2, $3, $4, ARRAY [CAST ($5 as numeric), CAST ($6 as numeric)], ARRAY [CAST ($7 as numeric), CAST ($8 as numeric)])`;

                const req = await pool.query(dbText, values);
            }
        }
    }

    console.log("finished matches in " + (Date.now() - start) + " ms");
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
