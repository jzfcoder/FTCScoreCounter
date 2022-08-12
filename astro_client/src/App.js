import "./App.css";
import React, { useEffect } from "react";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import CounterForm from "./Components/CounterForm";
import TournamentForm from "./Components/TournamentForm";
import { Link, Route, Routes } from "react-router-dom";
import ReactGA from 'react-ga';

const TRACKING_ID = "G-1F21T2210S";
ReactGA.initialize(TRACKING_ID);

function App() {
  useEffect(() => {
    ReactGA.initialize(TRACKING_ID);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);


  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="counter" element={<Counter />} />
        <Route path="tournament" element={<Tournament />} />
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <>
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

      <div style={{ zIndex: 100, paddingTop: "15%" }}>
        <h1>Welcome to the AstroBall</h1>
        <h2>A scoring and tournament simulator powered by AstroBruins</h2>

        <Link className="mainButton" to="/counter">Power Play Scoring Calculator</Link>

        <Link className="mainButton" to="/tournament">Tournament Simulator</Link>

        <a className="donate" href="https://hack.ms/donate-astrobruins" target="_blank" rel="noreferrer">Donate</a>
      </div>
    </>
  );
}

function Counter() {
  return <CounterForm />
}

function Tournament() {
  return <TournamentForm />
}

const particlesInit = async (main) => {
  // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
  // starting from v2 you can add only the features you need reducing the bundle size
  await loadFull(main);
};

const particlesLoaded = (container) => { };

export default App;
