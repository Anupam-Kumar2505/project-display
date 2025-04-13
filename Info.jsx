import { Cylinder, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";

function ccccc(children, color) {
  let fontSize;
  if (children == "RESEARCH") {
    fontSize = 300;
  } else {
    fontSize = 450;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 2048;
  const context = canvas.getContext("2d");

  context.fillStyle = "transparent";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = color;

  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.fillText(children, 1024, canvas.height / 2);

  return canvas;
}

function TextRing({ children }) {
  const backCanvas = useMemo(() => {
    return ccccc(children, "white ");
  }, [children]);

  

  // Cleanup on unmount

  const texture2 = useRef();
  useFrame(({ clock }) => {
    texture2.current.offset.x = -clock.getElapsedTime() / 10;
  });

  const cylArgs = [2, 2, 2, 64, 1, true];

  return (
    <group rotation-y={Math.PI / 4} scale={[1, 1, 1]}>
      {/* <primitive object={target.texture} ref={texture} wrapS={THREE.RepeatWrapping} wrapT={THREE.RepeatWrapping} repeat={[1, 1]} /> */}

      <Cylinder args={cylArgs}>
        <meshStandardMaterial attach="material" side={THREE.BackSide}>
          <canvasTexture
            attach="map"
            repeat={[16, 3]}
            image={backCanvas}
            premultiplyAlpha
            ref={texture2}
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
            onUpdate={(s) => (s.needsUpdate = true)}
          />
        </meshStandardMaterial>
      </Cylinder>
    </group>
  );
}

const CustomGLTF = ({ src }) => {
  const { scene } = useGLTF(src); // Load the model
  const modelRef = useRef(scene);
  const myMesh = useRef();
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    myMesh.current.position.y = 0.0 * (Math.sin(elapsedTime * 1) + 1);
    myMesh.current.rotation.y += 0.005;
  });
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const uv = child.geometry.attributes.uv.array;
          for (let i = 0; i < uv.length; i += 4) {
            uv[i] = 0;
            uv[i + 1] = 0;
            uv[i + 2] = 0;
            uv[i + 3] = 6;
          }

          child.material = new THREE.ShaderMaterial({
            vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
            fragmentShader: `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec4 c = texture2D(uTexture, vUv);
    gl_FragColor = c;
  }
`,
            uniforms: {
              uTime: { value: 0 },
              uTexture: {
                value: new THREE.TextureLoader().load("./image_light1.png"),
              },
            },
          });
        }
      });
    }
  }, [scene]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    modelRef.current.traverse((child) => {
      if (child.isMesh) {
        child.material.uniforms.uTime.value = elapsedTime;
      }
    });
  });

  return (
    <mesh ref={myMesh}>
      <primitive
        object={modelRef.current}
        scale={window.innerWidth >= 400 ? 0.3 : 0.2}
        position={[-0.01, -0.25, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
    </mesh>
  );
};

// corefinal.glb
// eventsfinal.glb
// rpfinal.glb

function Info() {
  const location = useLocation();
  const [glb, setGlb] = useState();
  const [glbText, setGlbText] = useState("");
  let frameloop;

  useEffect(() => {
    console.log("Info component mounted");

    return () => {
      console.log("Info component unmounted");
    };
  }, []);

  useEffect(() => {
    if (
      location.pathname === "/event" ||
      location.pathname === "/research" ||
      location.pathname === "core"
    ) {
      frameloop = "";
    } else {
      frameloop = "demand";
    }

    if (location.pathname === "/events") {
      setGlb("/eventsfinal.glb");
      setGlbText("EVENTS");
    } else if (location.pathname === "/research") {
      setGlb("/rpfinal.glb");
      setGlbText("RESEARCH");
    } else {
      setGlb("/corefinal.glb");
      setGlbText("CORE");
    }
  }, [location]);

  return (
    <div className="h-screen ">
      <Canvas
        performance={{ max: 0.5 }}
        camera={{ position: [2, 0, 0], fov: 25 }}
      >
        {/* <OrbitControls /> */}
        <ambientLight intensity={5} color="white" />

        <TextRing children={glbText} />
        <CustomGLTF src={glb}></CustomGLTF>
        {/* <SpotLight distance={1} angle={0.01} attenuation={5} anglePower={5} /> */}
        <pointLight
          color="white"
          intensity={0.3}
          position={[0, 5, 5]}
          decay={100}
        />

        {/* <OrbitControls /> */}
        {/* <EffectComposer>
          <Bloom mipmapBlur levels={7} intensity={0.2} />
        </EffectComposer> */}
      </Canvas>
    </div>
  );
}

export default Info;