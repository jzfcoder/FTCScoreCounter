// -- Production

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TournamentForm = () => {
	const [status, setStatus] = useState("Add Team");
	const [teams, setTeams] = useState([]);
	const [selected, setSelected] = useState(-1);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStatus("Searching...");

		const { name } = e.target.elements;
		let details = {
			name: name.value,
		};
		let response = await fetch("/post", {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify(details),
		});
		setStatus("Add Team");

		let result = await response.json().catch(alert("There was an error"));
		if (result.status === "found") {
			console.log(result);
			var exists = false;
			for (var team of teams) {
				if (team.number === result.teaminfo.number) {
					alert("team already in list");
					exists = true;
				}
			}
			if (!exists) {
				if (teams.length !== 0) { setTeams([...teams, result.teaminfo]); }
				else { setTeams([result.teaminfo]); }
			}
		}
		else { alert("Team not Found"); }
	};

	const handleRemove = (number) => {
		const newTeams = teams.filter((team) => team.number !== number);

		setTeams(newTeams);
	}

	const changeSelect = (number) => {
		setSelected(number);
	}

	return (
		<>
			<div className="tab">
				<Link to="/">
					<button className="tablink">&lt; Back</button>
				</Link>
				<button className="tablink active">Tournament Simulator</button>
			</div>

			<Particles id="tsparticles" init={particlesInit} loaded={particlesLoaded} options={{
				fullScreen: {
					enable: false
				},
				background: {
					color: {
						value: "#17182f",
					},
				},
				fpsLimit: 120,
				particles: {
					color: {
						value: "#ffffff",
					},
					move: {
						direction: "none",
						enable: true,
						outModes: {
							default: "bounce",
						},
						random: true,
						speed: 0.25,
						straight: false,
					},
					number: {
						density: {
							enable: true,
							area: 800,
						},
						value: 80,
					},
					opacity: {
						value: 0.5,
					},
					shape: {
						type: "circle",
					},
					size: {
						value: { min: 1, max: 5 },
					},
				},
				detectRetina: false,
			}} style={{ zIndex: -100, position: "absolute", display: "block" }} />

			<div className="bg">
				<form onSubmit={handleSubmit}>
					<label htmlFor="name">Search By Team Number: </label>
					<input type="text" id="name" className="searchInput" required />
					<button type="submit" className="searchButton">{status}</button>
				</form>
				<table>
					<thead>
						<tr style={{ textAlign: "center" }}>
							<th>Team</th>
							<th>Team Number</th>
							<th>Avg Points</th>
							<th>Predicted Score</th>
							<th>Prediction Confidence</th>
						</tr>
					</thead>
					<tbody>
						{
							teams.sort((a, b) => {
								if (a.predictedScore < b.predictedScore) {
									return 1;
								}
								if (a.predictedScore > b.predictedScore) {
									return -1;
								}

								return 0;
							}).map((team) => {
								return (
									<tr key={team.number}>
										<td>{team.name}</td>
										<td>{team.number}</td>
										<td>{team.avgScore}</td>
										<td>{team.predictedScore}</td>
										<td>{team.confidence}</td>
										<td><span onClick={() => handleRemove(team.number)} className="remove">&#215;</span></td>
										<td><span onClick={() => changeSelect(team.number)}>show graph</span></td>
									</tr>
								);
							})
						}
					</tbody>
				</table>
				<p>{teams.filter(function(x) { return x.number === selected; })}</p>
			</div>
		</>
	);
};

const particlesInit = async (main) => {
	// you can initialize the tsParticles instance (main) here, adding custom shapes or presets
	// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
	// starting from v2 you can add only the features you need reducing the bundle size
	await loadFull(main);
};

const particlesLoaded = (container) => { };

export default TournamentForm;