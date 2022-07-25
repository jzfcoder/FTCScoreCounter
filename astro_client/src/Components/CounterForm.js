import { Component } from "react";
import Tabs from "./Tabs";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";

class CounterForm extends Component {
  state = {
    formState: {
      // list all objectives here (default value, weight)
      firstObjective: [0, 10],
      secondObjective: [0, 30],
      thirdObjective: [0, 1],
      fourthObjective: [0, 3],
    }
  };

  getRunningTotal = () => {
    // ref all objectives here
    const objectives = [
      this.state.formState.firstObjective,
      this.state.formState.secondObjective,
      this.state.formState.thirdObjective,
      this.state.formState.fourthObjective,
    ];

    let sum = 0;
    for (let i = 0; i < objectives.length; i++) {
      sum +=
        Math.max(Number(objectives[i][0]), 0) * Number(objectives[i][1]);
    }

    return sum;
  };

  onClick = (event) => {
    var inputField = event.target;
    while (inputField.tagName !== "INPUT") {
      inputField = inputField.nextElementSibling;
    }
    this.setState((prevState) => {
      return {
        formState: {
          ...prevState.formState,
          [inputField.name]: [
            event.target.className === "arrow down"
              ? Number(Math.max(inputField.value - 1, 0))
              : Number(inputField.value) + 1,
            Number(inputField.className)
          ]
        }
      };
    });
  };

  render() {
    const { formState } = this.state;
    return (
      <div>
        <Form
          formState={formState}
          onClick={this.onClick}
          runningTotal={this.getRunningTotal()}
        />
      </div>
    );
  }
}

class Field extends Component {
  state = { inputFieldValue: 0 };

  increment(event) {
    this.props.onClick(event, this.inputFieldValue);
  }

  render() {
    return (
      <div className="row">
        <label htmlFor={this.props.name} className="label">{this.props.label}</label>
        <div className="numInput">
          <span className="arrow up" onClick={this.props.onClick} />
          <span className="arrow down" onClick={this.props.onClick} />
          <input
            type="text"
            name={this.props.name}
            value={this.props.value}
            className={this.props.className}
            readOnly
          />
        </div>
      </div>
    );
  }
}

class Form extends Component {
  render() {
    return (
      <>
        <Tabs total={this.props.runningTotal}>
          <div label="Auto" className="main" id="thing">
            <Field
              name="firstObjective" // must match firstObjective
              label="First Objective"
              value={this.props.formState.firstObjective[0]}
              className={this.props.formState.firstObjective[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="secondObjective" // must match secondObjective
              label="Second Objective"
              value={this.props.formState.secondObjective[0]}
              className={this.props.formState.secondObjective[1]}
              onClick={this.props.onClick}
            />
          </div>
          <div label="Driver Controlled" className="main">
            <Field
              name="thirdObjective" // must match third objective
              label="Third Objective"
              value={this.props.formState.thirdObjective[0]}
              className={this.props.formState.thirdObjective[1]}
              onClick={this.props.onClick}
            />
          </div>
          <div label="Endgame" className="main">
            <Field
              name="fourthObjective" // must match fourth objective
              label="Fourth Objective"
              value={this.props.formState.fourthObjective[0]}
              className={this.props.formState.fourthObjective[1]}
              onClick={this.props.onClick}
            />
          </div>
        </Tabs>
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
      </>
    );
  }
}

const particlesInit = async (main) => {
  // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
  // starting from v2 you can add only the features you need reducing the bundle size
  await loadFull(main);
};

const particlesLoaded = (container) => { };

export default CounterForm;