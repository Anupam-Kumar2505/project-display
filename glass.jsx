import React, { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  useGLTF,
  Text,
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
} from "@react-three/drei";
import { easing } from "maath";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animated, useScroll, useSpring } from "@react-spring/three";
import Footer from "./footer.jsx";

gsap.registerPlugin(ScrollTrigger);

const glass = () => {
  const containerRef = useRef(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // useEffect(() => {
  //   const container = containerRef.current;

  //   gsap.to(container, {
  //     scrollTrigger: {
  //       trigger: container,
  //       start: "top top",
  //       end: "bottom bottom",
  //       scrub: true,
  //     },
  //     opacity: 1,
  //   });
  // }, []);

  return (
    <div ref={containerRef} className="h-lvh ">
      <Canvas camera={{ position: [10, 200, 0], fov: 50 }}>
        <color attach="background" args={["#ffffff"]} />
        <spotLight
          position={[20, 20, 10]}
          penumbra={1}
          castShadow
          angle={0.2}
        />
        <AnimatedText />
        <AnimatedAcm />

        <Rig />
      </Canvas>
    </div>
  );
};

function AnimatedText() {
  const textRef = useRef();

  // useEffect(() => {
  //   gsap.to(textRef.current.material, {
  //     opacity: 0,
  //     scrollTrigger: {
  //       trigger: "#root",
  //       start: "top top",
  //       end: "bottom bottom",
  //       scrub: true,
  //     },
  //   });
  // }, []);

  return (
    <>
      <Text
        position={[-20, 1.5, 8]}
        fontSize={10}
        font="/impact.ttf"
        scale={[0.9, 0.9, 1]}
        rotation={[0, 0, Math.PI / 9]}
        fillOpacity={0}
        // outlineWidth={0.05}
        // outlineColor="black"
        // outlineOpacity={1}
        strokeOpacity={1}
        strokeWidth={0.07}
        strokeColor="black"
        direction="auto"
        styles={{ opacity: 1 }}
      >
        DJSACMDJSACM
      </Text>
      <Text
        ref={textRef}
        // position={[-20, 0, -30]}
        position={[0, 0, -5]} // Adjust position to center the text
        fontSize={10} // Large text
        font="/impact.ttf"
        scale={[2, 2, 1]}
        rotation={[0, 0, Math.PI / 9]}
        fillOpacity={1}
        color="black"
      >
        EVOLVING
      </Text>
      <Text
        position={[-20, -16, 8]}
        fontSize={10}
        font="/impact.ttf"
        scale={[0.9, 0.9, 1]}
        rotation={[0, 0, Math.PI / 9]}
        fillOpacity={0}
        // outlineWidth={0.05}
        // outlineColor="black"
        // outlineOpacity={1}
        strokeOpacity={1}
        strokeWidth={0.07}
        strokeColor="black"
      >
        DJSACMDJSACMDJSACM
      </Text>
    </>
  );
}

export function AnimatedAcm() {
  const { scene, nodes, materials } = useGLTF("/untitled.glb");
  const meshRef = useRef();

  // useEffect(() => {
  //   gsap.to(meshRef.current.position, {
  //     y: -10,
  //     scrollTrigger: {
  //       trigger: "#root",
  //       start: "top top",
  //       end: "bottom bottom",
  //       scrub: true,
  //     },
  //   });
  // }, []);

  return (
    <mesh
      ref={meshRef}
      geometry={nodes.Cube001.geometry}
      material={materials}
      rotation={[0, -Math.PI / 2, 0]}
      position={[1, 0, 5]}
      scale={3}
    >
      <MeshTransmissionMaterial
        roughness={0.2}
        backside
        backsideThickness={5}
        thickness={2}
        color=""
      />
    </mesh>
  );
}

function Rig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [
        Math.sin(-state.pointer.x) * 5,
        state.pointer.y * 3.5,
        15 + Math.cos(state.pointer.x) * 10,
      ],
      0.2,
      delta
    );
    state.camera.lookAt(0, 0, 0);
  });
}

export default glass;
