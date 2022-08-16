import { Component } from "react";
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
import { Line } from 'react-chartjs-2';

class Graph extends Component {
	constructor(props) {
		super(props);

		ChartJS.register(
			CategoryScale,
			LinearScale,
			PointElement,
			LineElement,
			Title,
			Tooltip,
			Legend
		);
	}

	render() {
		var labels = [];
		if (this.props.team !== -1) {
			for (var i = 0; i < this.props.team.scores.length; i++) {
				labels.push(i + 1);
			}
		}
		return (
			<div style={{ float: "right", width: "700px" }}>
				<Line
					options={
						{
							responsive: true,
							plugins: {
								legend: {
									position: 'top',
								},
								title: {
									display: true,
									text: 'Chart.js Line Chart',
								},
							},
						}
					}

					data={
						{
							labels: labels,
							datasets: [
								{
									label: 'Match Data',
									data: this.props.team.scores,
									borderColor: 'rgb(255, 99, 132)',
									backgroundColor: 'rgba(255, 99, 132, 0.5)',
								},
								{
									label: 'Regression Line',
									data: this.props.team.regScores,
									borderColor: 'rgb(53, 162, 235)',
									backgroundColor: 'rgba(53, 162, 235, 0.5)',
								},
							],
						}
					}
				/>
			</div>
		);
	}
}

export default Graph;