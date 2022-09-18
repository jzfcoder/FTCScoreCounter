// -- Production

const express = require('express');
const schedule = require('node-schedule');
const { Pool } = require('pg');
const childProcess = require('child_process');
require('dotenv').config();

const path = require('path');

const PORT = process.env.PORT || 80;
const HOST = process.env.HOST || 'ec2-34-220-119-128.us-west-2.compute.amazonaws.com';
const app = express();

const credentials = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
        require: true,
        rejectUnauthorized: false,
    }
}

app.listen(PORT, HOST, console.log(`Server started on port ${PORT} with host ${HOST}`));

console.log("running on " + process.env.NODE_ENV);

app.use(express.static('../astro_client/build'));
app.use(express.json());
app.get('*', (req, res) => {
    req.sendFile(path.resolve('astro_client/build/index.html', { root: "../" }));
});

app.post("/post", async (req, res) => {
    const queryRes = await searchFromQuery(req.body.name);

    res.json({
        status: queryRes.isFound ? "found" : "notFound",
        teaminfo: {
            name: queryRes.name,
            number: queryRes.number,
            scores: queryRes.scores,
            regScores: queryRes.regScores,
            avgScore: queryRes.avgScore,
            predictedScore: queryRes.predictedScore,
            confidence: queryRes.confidence
        }
    });
});

app.get("/", function (req, res) {
    res.sendFile('astro_client/build/index.html', { root: "../" });
});

app.get("/logo192.png", function (req, res) {
    res.sendFile('astro_server/logo192.png', { root: "../" });
});

app.get("/logo512.png", function (req, res) {
    res.sendFile('astro_server/logo512.png', { root: "../" })
});

function linearRegression(y, x) {
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

    return lr;
}

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
            scores: [],
            regScores: [],
            avgScore: -1,
            predictedScore: -1,
            confidence: -1
        }
    }

    // TODO: SORT BY DATE
    const later = await pool.query(`SELECT * FROM public.matches WHERE ${num}=ANY(blueteams) OR ${num}=ANY(redteams)`);

    await pool.end();
    var avg = 0;
    var sum = 0;
    var scores = [];

    if (later.rows.length > 0) {
        const isRed = later.rows[0].redteams[0] === num || later.rows.redteams[1] === num;
        for (var row of later.rows) {
            if (isRed) {
                sum += Number(row.redscore);
                scores.push(Number(row.redscore));
            }
            else {
                sum += Number(row.bluescore);
                scores.push(Number(row.bluescore));
            }
        }
    }

    avg = Math.round(sum / later.rows.length);

    var known_x = [];

    for (var i = 1; i <= later.rows.length; i++)
    {
        known_x.push(i);
    }

    const eq = linearRegression(scores, known_x);
    const pred_score = (eq.slope * (later.rows.length + 1)) + eq.intercept;

    for (var i = 0; i < known_x.length; i++)
    {
        known_x[i] = Math.round((eq.slope * known_x[i]) + eq.intercept);
    }
    known_x.push(pred_score);

    return {
        isFound: true,
        name: now.rows[0].name,
        number: now.rows[0].teamnumber,
        scores: scores,
        regScores: known_x,
        avgScore: isNaN(avg) ? 0 : avg,
        predictedScore: Math.round(pred_score),
        confidence: parseFloat(eq.r2.toPrecision(3)),
        scores: scores
    }
}

const rule = new schedule.RecurrenceRule();

rule.hour = 03;
rule.minute = 00;
rule.second = 00;
rule.dayOfWeek = new schedule.Range(0, 6);

const updateDB = schedule.scheduleJob(rule, function() {
    runScript('./db.js', function (err)
    {
        if(err) throw err;
        console.log("finished calling db.js");
    });
});

function runScript(scriptPath, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}
