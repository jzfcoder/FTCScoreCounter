import { Component } from "react";
import Tabs from "./Tabs";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";

class CounterForm extends Component {
  state = {
    formState: {
      // list all objectives here (default value, weight)
      fourthObjective: [0, 3],

      a_conePlacedInTerminal: [0, 1],

      a_conesInGroundJunction: [0, 2],
      a_conesOnLowJunction: [0, 3],
      a_conesOnMediumJunction: [0, 4],
      a_conesOnHighJunction: [0, 5],

      a_robotParkedInSignalZone: [0, 10],
      a_robotParkedInCustomSignalZone: [0, 20],
      a_robotParkedInTerminal: [0, 2],

      t_conePlacedInTerminal: [0, 1],
      t_conesInGroundJunction: [0, 2],
      t_conesOnLowJunction: [0, 3],
      t_conesOnMediumJunction: [0, 4],
      t_conesOnHighJunction: [0, 5],

      e_robotParkedInTerminal: [0, 2],
      e_junctionOwnedByCone: [0, 3],
      e_junctionOwnedByBeacon: [0, 10],
      e_completedCircuit: [0, 20],
    },
    conesAvailable: 30,
  };

  getRunningTotal = () => {
    // ref all objectives here
    const objectives = [
      this.state.formState.fourthObjective,

      this.state.formState.a_conePlacedInTerminal,
      this.state.formState.a_conesInGroundJunction,
      this.state.formState.a_conesOnLowJunction,
      this.state.formState.a_conesOnMediumJunction,
      this.state.formState.a_conesOnHighJunction,

      this.state.formState.a_robotParkedInSignalZone,
      this.state.formState.a_robotParkedInCustomSignalZone,
      this.state.formState.a_robotParkedInTerminal,

      this.state.formState.t_conePlacedInTerminal,
      this.state.formState.t_conesInGroundJunction,
      this.state.formState.t_conesOnLowJunction,
      this.state.formState.t_conesOnMediumJunction,
      this.state.formState.t_conesOnHighJunction,

      this.state.formState.e_robotParkedInTerminal,
      this.state.formState.e_junctionOwnedByCone,
      this.state.formState.e_junctionOwnedByBeacon,
      this.state.formState.e_completedCircuit,
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
      if(event.target.className === "arrow down")
      {
        let val = inputField.value;
        let cones = prevState.conesAvailable;
        if(val > 0)
        {
          val--;
          cones++;
        }
        return {
          formState: {
            ...prevState.formState,
            [inputField.name]: [val, inputField.className]
          },
          conesAvailable: cones,
        }
      }
      else
      {
        let val = inputField.value;
        let cones = prevState.conesAvailable;
        if(cones === 0)
        {
          alert("out of cones");
        }
        else
        {
          val++;
          cones--;
        }
        return {
          formState: {
            ...prevState.formState,
            [inputField.name]: [val, inputField.className]
          },
          conesAvailable: cones,
        }
      }
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
          availCones={this.state.conesAvailable}
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
        <label htmlFor={this.props.name} className="label">{this.props.label + ":"}</label>
        <div className="numInput">
          <span className="arrow up" onClick={this.props.onClick} />
          <span className="arrow down" onClick={this.props.onClick} />
          <input
            type="text"
            name={this.props.name}
            value={this.props.value}
            className={this.props.className}
            style={{width:"100px"}}
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
        <Tabs total={this.props.runningTotal} availCones={this.props.availCones}>
          <div label="Auto" className="main" id="thing">
            <Field
              name="a_conePlacedInTerminal"
              label="Cones placed in terminal"
              value={this.props.formState.a_conePlacedInTerminal[0]}
              className={this.props.formState.a_conePlacedInTerminal[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_conesInGroundJunction"
              label="Cones placed in ground junction"
              value={this.props.formState.a_conesInGroundJunction[0]}
              className={this.props.formState.a_conesInGroundJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_conesOnLowJunction"
              label="Cones placed on low junction"
              value={this.props.formState.a_conesOnLowJunction[0]}
              className={this.props.formState.a_conesOnLowJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_conesOnMediumJunction"
              label="Cones placed on medium junction"
              value={this.props.formState.a_conesOnMediumJunction[0]}
              className={this.props.formState.a_conesOnMediumJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_conesOnHighJunction"
              label="Cones placed on high junction"
              value={this.props.formState.a_conesOnHighJunction[0]}
              className={this.props.formState.a_conesOnHighJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_robotParkedInSignalZone"
              label="Robots parked in correct signal Zone"
              value={this.props.formState.a_robotParkedInSignalZone[0]}
              className={this.props.formState.a_robotParkedInSignalZone[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_robotParkedInCustomSignalZone"
              label="Robots parked in correct CUSTOM signal zone"
              value={this.props.formState.a_robotParkedInCustomSignalZone[0]}
              className={this.props.formState.a_robotParkedInCustomSignalZone[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="a_robotParkedInTerminal"
              label="Robots parked in terminal"
              value={this.props.formState.a_robotParkedInTerminal[0]}
              className={this.props.formState.a_robotParkedInTerminal[1]}
              onClick={this.props.onClick}
            />
          </div>
          <div label="Driver Controlled" className="main">
            <Field
              name="t_conePlacedInTerminal"
              label="Cones placed in terminal"
              value={this.props.formState.t_conePlacedInTerminal[0]}
              className={this.props.formState.a_conePlacedInTerminal[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="t_conesInGroundJunction"
              label="Cones in ground junction"
              value={this.props.formState.t_conesInGroundJunction[0]}
              className={this.props.formState.t_conesInGroundJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="t_conesOnLowJunction"
              label="Cones on low junction"
              value={this.props.formState.t_conesOnLowJunction[0]}
              className={this.props.formState.t_conesOnLowJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="t_conesOnMediumJunction"
              label="Cones on medium junction"
              value={this.props.formState.t_conesOnMediumJunction[0]}
              className={this.props.formState.t_conesOnMediumJunction[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="t_conesOnHighJunction"
              label="Cones on high junction"
              value={this.props.formState.t_conesOnHighJunction[0]}
              className={this.props.formState.t_conesOnHighJunction[1]}
              onClick={this.props.onClick}
            />
          </div>
          <div label="Endgame" className="main">
            <Field
              name="e_robotParkedInTerminal" // must match fourth objective
              label="Robots parked in terminal"
              value={this.props.formState.e_robotParkedInTerminal[0]}
              className={this.props.formState.e_robotParkedInTerminal[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="e_junctionOwnedByCone"
              label="Junctions owned by cone"
              value={this.props.formState.e_junctionOwnedByCone[0]}
              className={this.props.formState.e_junctionOwnedByCone[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="e_junctionOwnedByBeacon"
              label="Junctions owned by beacon"
              value={this.props.formState.e_junctionOwnedByBeacon[0]}
              className={this.props.formState.e_junctionOwnedByBeacon[1]}
              onClick={this.props.onClick}
            />
            <Field
              name="e_completedCircuit"
              label="Completed Circuit"
              value={this.props.formState.e_completedCircuit[0]}
              className={this.props.formState.e_completedCircuit[1]}
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