import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
// import { useControls } from "leva";
import { useCursor } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
gsap.registerPlugin(ScrollTrigger);

export function brain(props) {
  const { nodes } = useGLTF("/brainfinal.glb");
  const group = useRef();
  const group2 = useRef();

  const bluebirddistance = {
    value: 2.4,
    min: 0,
    max: 10,
  };

  // const pointsRef = useRef < THREE.Points > null;
  // const hoverpointsRef = useRef < THREE.points > null;
  const { size } = useThree();

  const [hovered, setHovered] = useState(false);

  const shaderMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(0.0, 0.0) },
        hoverEffectSize: { value: 0.5 },
        pointTexture: {
          value: new THREE.TextureLoader().load("/triangle.png"),
        },
        voronoiTexture: {
          value: new THREE.TextureLoader().load("/image1.png"),
        },
      },
      vertexShader: `
    uniform vec2 uMouse;
    uniform float uTime;
    uniform float hoverEffectSize;
    varying vec2 vUv;
    varying float vDist;
    void main() {
      vec3 transformedPosition = position;

      // Pass UV coordinates
      vUv = uv;
      // Calculate distance to mouse
      vec2 pointPos = (modelViewMatrix * vec4(transformedPosition, 1.0)).xy;
      vDist = distance(pointPos, uMouse);
      // Set point size
      gl_PointSize = mix(9.0, 90.0, smoothstep(hoverEffectSize, 0.0, vDist));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
    }
  `,
      fragmentShader: `
      uniform sampler2D pointTexture;
      uniform sampler2D voronoiTexture; // Uniform for the Voronoi texture
      uniform float uTime;
      uniform float hoverEffectSize;
      varying vec2 vUv;
      varying float vDist;
      void main() {
        // Sample the Voronoi texture using UV coordinates
        vec4 voronoiColor = texture2D(voronoiTexture, vUv);
        // Mix Voronoi texture color with hover effect
        vec3 hoverColor = vec3(0.8);
        vec3 finalColor = mix(hoverColor, voronoiColor.rgb, smoothstep(0.0, hoverEffectSize, vDist));
        // Rotate point texture based on time
        float angle = uTime;
        vec2 center = vec2(0.5, 0.5);
        vec2 rotatedCoord = gl_PointCoord - center;
        rotatedCoord = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * rotatedCoord;
        rotatedCoord += center;
        // Sample the point texture
        vec4 textureColor = texture2D(pointTexture, rotatedCoord);
        // Discard transparent pixels from point texture
        if (textureColor.a < 0.1) discard;
        // Combine Voronoi texture and point texture
        gl_FragColor = vec4(finalColor, textureColor.a) * textureColor;
      }
    `,

      transparent: true,
    })
  ).current;

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
  });

  const handleMouseMove = (event) => {
    const { width, height } = size;
    shaderMaterial.uniforms.uMouse.value.set(
      (event.clientX / width) * 2 - 1,
      -(event.clientY / height) * 2 + 1
    );
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  const handlePointerEnter = () => setHovered(true);
  const handlePointerLeave = () => setHovered(false);
  useCursor(hovered);

  // const hoverpointsRef = useRef(null);
  // const { size, camera } = useThree();
  // const [hovered, setHovered] = useState(false);

  // const raycaster = useRef(new THREE.Raycaster());
  // const mouse = useRef(new THREE.Vector2());

  // const shaderMaterial = useRef(
  //   new THREE.ShaderMaterial({
  //     uniforms: {
  //       uTime: { value: 0.0 },
  //       uMouse: { value: new THREE.Vector2(0.0, 0.0) },
  //       hoverEffectSize: { value: 0.8 },
  //       pointTexture: {
  //         value: new THREE.TextureLoader().load("/triangle.png"),
  //       },
  //       voronoiTexture: {
  //         value: new THREE.TextureLoader().load("/image1.png"),
  //       },
  //     },
  //     vertexShader: `
  //       uniform vec2 uMouse;
  //       uniform float uTime;
  //       uniform float hoverEffectSize;
  //       varying vec2 vUv;
  //       varying float vDist;
  //       void main() {
  //         vec3 transformedPosition = position;
  //         vUv = uv;
  //         vec2 pointPos = (modelViewMatrix * vec4(transformedPosition, 1.0)).xy;
  //         vDist = distance(pointPos, uMouse);
  //         gl_PointSize = mix(9.0, 90.0, smoothstep(hoverEffectSize, 0.0, vDist));
  //         gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
  //       }
  //     `,
  //     fragmentShader: `
  //       uniform sampler2D pointTexture;
  //       uniform sampler2D voronoiTexture;
  //       uniform float uTime;
  //       uniform float hoverEffectSize;
  //       varying vec2 vUv;
  //       varying float vDist;
  //       void main() {
  //         vec4 voronoiColor = texture2D(voronoiTexture, vUv);
  //         vec3 hoverColor = vec3(0.8);
  //         vec3 finalColor = mix(hoverColor, voronoiColor.rgb, smoothstep(0.0, hoverEffectSize, vDist));
  //         float angle = uTime;
  //         vec2 center = vec2(0.5, 0.5);
  //         vec2 rotatedCoord = gl_PointCoord - center;
  //         rotatedCoord = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * rotatedCoord;
  //         rotatedCoord += center;
  //         vec4 textureColor = texture2D(pointTexture, rotatedCoord);
  //         if (textureColor.a < 0.1) discard;
  //         gl_FragColor = vec4(finalColor, textureColor.a) * textureColor;
  //       }
  //     `,
  //     transparent: true,
  //   })
  // ).current;

  // useFrame(({ clock }) => {
  //   shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();

  //   if (hoverpointsRef.current) {
  //     raycaster.current.setFromCamera(mouse.current, camera);
  //     const intersects = raycaster.current.intersectObject(
  //       hoverpointsRef.current
  //     );

  //     if (intersects.length > 0) {
  //       const point = intersects[0].point;
  //       shaderMaterial.uniforms.uMouse.value.set(point.x, point.y);
  //       setHovered(true);
  //     } else {
  //       setHovered(false);
  //       shaderMaterial.uniforms.uMouse.value.set(1000, 1000); // Far away to disable hover effect
  //     }
  //   }
  // });

  // const handleMouseMove = (event) => {
  //   const { width, height } = size;
  //   mouse.current.set(
  //     (event.clientX / width) * 2 - 1,
  //     -(event.clientY / height) * 2 + 1
  //   );
  // };

  // useEffect(() => {
  //   window.addEventListener("mousemove", handleMouseMove);
  //   return () => window.removeEventListener("mousemove", handleMouseMove);
  // }, [size]);

  // useCursor(hovered);

  // const scrollData = useScroll();

  // // const snapPoints = [
  // //   // [0.2, 0.3],
  // //   [0.75, 1],
  // // ];

  // // useEffect(() => {
  // //   let i = 0;
  // //   for (i = 0; i < snapPoints.length; i++) {
  // //     if (
  // //       scrollData.offset > snapPoints[i][0] &&
  // //       scrollData.offset < (snapPoints[i][0] + snapPoints[i][1]) / 2
  // //     ) {
  // //       scrollData.offset = snapPoints[i][0];
  // //     } else if (
  // //       scrollData.offset > (snapPoints[i][0] + snapPoints[i][1]) / 2 &&
  // //       scrollData.offset < snapPoints[i][1]
  // //     ) {
  // //       scrollData.offset = snapPoints[i][1];
  // //     }
  // //   }
  // // }, [scrollData.offset]);

  // useEffect(() => {
  //   const groupWorldPosition = new THREE.Vector3();
  //   group.current.getWorldPosition(groupWorldPosition);

  //   group.current.children.forEach((mesh) => {
  //     mesh.originalPosition = mesh.position.clone();
  //     const meshWorldPosition = new THREE.Vector3();

  //     mesh.getWorldPosition(meshWorldPosition);
  //     mesh.get;

  //     mesh.directionVector = meshWorldPosition
  //       .clone()
  //       .sub(groupWorldPosition)
  //       .normalize();
  //     mesh.targetPosition = mesh.originalPosition
  //       .clone()
  //       .add(mesh.directionVector.clone().multiplyScalar(3));
  //   });
  // }, []);

  // let check1 = 0;
  // let check2 = 0;

  // useFrame(() => {
  //   const minScroll = 0.25; // Start of explosion
  //   const maxScroll = 1; // End of explosion

  //   // if (scrollData.offset < 0.001) {
  //   //   check1 = 0;
  //   //   check2 = 0;
  //   // }

  //   // if (check1 == 0 && scrollData.offset > 0.01 && scrollData.offset < 0.2) {
  //   //   check1 = 1;
  //   //   scrollData.el.scrollTo({
  //   //     top: 995,
  //   //     behavior: "smooth",
  //   //   });
  //   // } else if (
  //   //   check2 == 0 &&
  //   //   scrollData.offset > 0.51 &&
  //   //   scrollData.offset < 0.6
  //   // ) {
  //   //   check2 = 1;
  //   //   scrollData.el.scrollTo({
  //   //     top: 2190,
  //   //     behavior: "smooth",
  //   //   });
  //   // }

  //   const normalizedScroll = THREE.MathUtils.clamp(
  //     (scrollData.offset - minScroll) / (maxScroll - minScroll),
  //     0,
  //     1
  //   );

  //   group.current.children.forEach((mesh) => {
  //     if (scrollData.offset > 0.25) {
  //       if (mesh.name === "origin") {
  //         mesh.visible = false;
  //       } else {
  //         mesh.visible = true;
  //       }
  //     } else {
  //       if (mesh.name === "origin") {
  //         mesh.visible = true;
  //       } else {
  //         mesh.visible = false;
  //       }
  //     }

  //     if (scrollData.offset <= minScroll) {
  //       // Perform initial operations (e.g., rotation, scaling)

  //       mesh.position.z = THREE.MathUtils.lerp(
  //         mesh.originalPosition.z + 0,
  //         mesh.originalPosition.z + 14, // Example: Slight upward movement
  //         scrollData.offset // Use original offset for minor animations
  //       );
  //     } else if (scrollData.offset > minScroll) {
  //       // Perform the explode effect
  //       mesh.position.x = THREE.MathUtils.lerp(
  //         mesh.originalPosition.x,
  //         mesh.targetPosition.x + 100,
  //         normalizedScroll // Use normalized offset
  //       );
  //       mesh.position.y = THREE.MathUtils.lerp(
  //         mesh.originalPosition.y,
  //         mesh.targetPosition.y,
  //         normalizedScroll
  //       );
  //       mesh.position.z = THREE.MathUtils.lerp(
  //         mesh.originalPosition.z + 3.5,
  //         mesh.targetPosition.z - 30,
  //         normalizedScroll
  //       );
  //     }
  //   });
  // });

  const { gl, scene } = useThree();

  useEffect(() => {
    const groupWorldPosition = new THREE.Vector3();
    group2.current.getWorldPosition(groupWorldPosition);

    group2.current.children.forEach((mesh) => {
      // Calculate original and target positions
      mesh.originalPosition = mesh.position.clone();
      const meshWorldPosition = new THREE.Vector3();
      mesh.getWorldPosition(meshWorldPosition);

      mesh.directionVector = meshWorldPosition
        .clone()
        .sub(groupWorldPosition)
        .normalize();
      mesh.targetPosition = mesh.originalPosition
        .clone()
        .add(mesh.directionVector.clone().multiplyScalar(3));
    });

    // GSAP Timeline for animations
    const timeline = gsap.timeline({
      scrollTrigger: {
        id: "scrollTrigger",
        trigger: ".panel2",
        start: "top bottom",
        endTrigger: ".panel3",
        end: "bottom bottom",
        snap: {
          snapTo: 0.5,
          duration: 0.5,
          delay: 0.1,
          ease: "power1.inOut",
        },
        scrub: 0.1,
      },
    });

    timeline.to(
      group.current.position,
      {
        x: group.current.position.x - 1,
        duration: 1,
        ease: "power1.out",
      },
      0
    );

    timeline.to(
      group.current.rotation,
      {
        y: Math.PI / 2,
        duration: 1,
        ease: "power1.out",
      },
      0 
    );

    group2.current.children.forEach((mesh) => {
      
      timeline.to(
        mesh.position,
        {
          x: mesh.targetPosition.x - 20,
          y: mesh.targetPosition.y - 2,
          z: mesh.targetPosition.z,
          duration: 1,
          ease: "power1.out",
        },
        1
      );

      
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  useFrame(() => {
    group.current.children.forEach((mesh) => {
      if (ScrollTrigger.getById("scrollTrigger").progress > 0.51) {
        mesh.visible = mesh.name !== "origin";
      } else {
        mesh.visible = mesh.name === "origin";
      }
    });
  });
  return (
    <group
      {...props}
      dispose={null}
      ref={group}
      rotation={[0, -Math.PI / 2.5, 0]}
      scale={window.innerWidth >= 400 ? 0.21 : 0.1}
      position={[0, 0, 0]}
    >
      <group name="origin" scale={3}>
        {/* <points
          // ref={hoverpointsRef}
          name="origin"
          geometry={nodes.origin.geometry}
          material={shaderMaterial}
          rotation={[-Math.PI, 1.559, -Math.PI]}
        /> */}
        <points
          name="origin"
          geometry={nodes.defaultMaterial002.geometry}
          material={shaderMaterial}
        />
        <points
          name="origin"
          geometry={nodes.defaultMaterial002_1.geometry}
          material={shaderMaterial}
        />
        <points
          name="origin"
          geometry={nodes.defaultMaterial002_2.geometry}
          material={shaderMaterial}
        />
      </group>
      <group ref={group2} scale={3}>
        <points
          name="defaultMaterial001_cell"
          geometry={nodes.defaultMaterial001_cell.geometry}
          material={shaderMaterial}
          position={[0.843, -1.579, -1.211]}
        />
        <points
          name="defaultMaterial001_cell001"
          geometry={nodes.defaultMaterial001_cell001.geometry}
          material={shaderMaterial}
          position={[0.812, -1.464, -0.903]}
        />
        <points
          name="defaultMaterial001_cell002"
          geometry={nodes.defaultMaterial001_cell002.geometry}
          material={shaderMaterial}
          position={[0.227, -1.57, -1.721]}
        />
        <points
          name="defaultMaterial001_cell003"
          geometry={nodes.defaultMaterial001_cell003.geometry}
          material={shaderMaterial}
          position={[-0.394, -1.289, -0.892]}
        />
        <points
          name="defaultMaterial001_cell004"
          geometry={nodes.defaultMaterial001_cell004.geometry}
          material={shaderMaterial}
          position={[-0.183, -1.484, -2.177]}
        />
        <points
          name="defaultMaterial001_cell005"
          geometry={nodes.defaultMaterial001_cell005.geometry}
          material={shaderMaterial}
          position={[0.263, -1.578, -2.088]}
        />
        <points
          name="defaultMaterial001_cell006"
          geometry={nodes.defaultMaterial001_cell006.geometry}
          material={shaderMaterial}
          position={[0.725, -0.599, -1.587]}
        />
        <points
          name="defaultMaterial001_cell007"
          geometry={nodes.defaultMaterial001_cell007.geometry}
          material={shaderMaterial}
          position={[-0.001, -0.956, -2.067]}
        />
        <points
          name="defaultMaterial001_cell008"
          geometry={nodes.defaultMaterial001_cell008.geometry}
          material={shaderMaterial}
          position={[-0.603, -1.377, -0.827]}
        />
        <points
          name="defaultMaterial001_cell009"
          geometry={nodes.defaultMaterial001_cell009.geometry}
          material={shaderMaterial}
          position={[-0.464, -1.666, -1.901]}
        />
        <points
          name="defaultMaterial001_cell010"
          geometry={nodes.defaultMaterial001_cell010.geometry}
          material={shaderMaterial}
          position={[0.694, -1.316, -2.088]}
        />
        <points
          name="defaultMaterial001_cell011"
          geometry={nodes.defaultMaterial001_cell011.geometry}
          material={shaderMaterial}
          position={[0.059, -1.129, -0.993]}
        />
        <points
          name="defaultMaterial001_cell012"
          geometry={nodes.defaultMaterial001_cell012.geometry}
          material={shaderMaterial}
          position={[-0.715, -0.401, -1.376]}
        />
        <points
          name="defaultMaterial001_cell013"
          geometry={nodes.defaultMaterial001_cell013.geometry}
          material={shaderMaterial}
          position={[0.055, -0.196, -1.197]}
        />
        <points
          name="defaultMaterial001_cell014"
          geometry={nodes.defaultMaterial001_cell014.geometry}
          material={shaderMaterial}
          position={[-0.5, -0.983, -0.785]}
        />
        <points
          name="defaultMaterial001_cell015"
          geometry={nodes.defaultMaterial001_cell015.geometry}
          material={shaderMaterial}
          position={[0.315, -1.403, -1.065]}
        />
        <points
          name="defaultMaterial001_cell016"
          geometry={nodes.defaultMaterial001_cell016.geometry}
          material={shaderMaterial}
          position={[-0.821, -1.457, -0.883]}
        />
        <points
          name="defaultMaterial001_cell017"
          geometry={nodes.defaultMaterial001_cell017.geometry}
          material={shaderMaterial}
          position={[-0.607, -1.639, -1.395]}
        />
        <points
          name="defaultMaterial001_cell018"
          geometry={nodes.defaultMaterial001_cell018.geometry}
          material={shaderMaterial}
          position={[-0.799, -1.511, -1.974]}
        />
        <points
          name="defaultMaterial001_cell019"
          geometry={nodes.defaultMaterial001_cell019.geometry}
          material={shaderMaterial}
          position={[0.487, -1.619, -1.366]}
        />
        <points
          name="defaultMaterial001_cell020"
          geometry={nodes.defaultMaterial001_cell020.geometry}
          material={shaderMaterial}
          position={[0.192, -1.482, -1.266]}
        />
        <points
          name="defaultMaterial001_cell021"
          geometry={nodes.defaultMaterial001_cell021.geometry}
          material={shaderMaterial}
          position={[0.34, -1.065, -0.838]}
        />
        <points
          name="defaultMaterial001_cell022"
          geometry={nodes.defaultMaterial001_cell022.geometry}
          material={shaderMaterial}
          position={[-1.143, -1.379, -1.024]}
        />
        <points
          name="defaultMaterial001_cell023"
          geometry={nodes.defaultMaterial001_cell023.geometry}
          material={shaderMaterial}
          position={[0.011, -1.464, -1.399]}
        />
        <points
          name="defaultMaterial001_cell024"
          geometry={nodes.defaultMaterial001_cell024.geometry}
          material={shaderMaterial}
          position={[0.914, -1.529, -1.857]}
        />
        <points
          name="defaultMaterial001_cell025"
          geometry={nodes.defaultMaterial001_cell025.geometry}
          material={shaderMaterial}
          position={[0.019, -1.218, -2.142]}
        />
        <points
          name="defaultMaterial001_cell026"
          geometry={nodes.defaultMaterial001_cell026.geometry}
          material={shaderMaterial}
          position={[-1.018, -1.135, -0.759]}
        />
        <points
          name="defaultMaterial001_cell027"
          geometry={nodes.defaultMaterial001_cell027.geometry}
          material={shaderMaterial}
          position={[0.207, -1.019, -2]}
        />
        <points
          name="defaultMaterial001_cell028"
          geometry={nodes.defaultMaterial001_cell028.geometry}
          material={shaderMaterial}
          position={[-0.77, -1.278, -0.702]}
        />
        <points
          name="defaultMaterial001_cell029"
          geometry={nodes.defaultMaterial001_cell029.geometry}
          material={shaderMaterial}
          position={[-0.61, -1.195, -0.717]}
        />
        <points
          name="defaultMaterial001_cell030"
          geometry={nodes.defaultMaterial001_cell030.geometry}
          material={shaderMaterial}
          position={[-0.314, -1.556, -1.401]}
        />
        <points
          name="defaultMaterial001_cell031"
          geometry={nodes.defaultMaterial001_cell031.geometry}
          material={shaderMaterial}
          position={[1.091, -0.712, -1.196]}
        />
        <points
          name="defaultMaterial001_cell032"
          geometry={nodes.defaultMaterial001_cell032.geometry}
          material={shaderMaterial}
          position={[0.056, -1.385, -2.154]}
        />
        <points
          name="defaultMaterial001_cell033"
          geometry={nodes.defaultMaterial001_cell033.geometry}
          material={shaderMaterial}
          position={[1.232, -1.236, -1.029]}
        />
        <points
          name="defaultMaterial001_cell034"
          geometry={nodes.defaultMaterial001_cell034.geometry}
          material={shaderMaterial}
          position={[-0.21, -0.946, -0.836]}
        />
        <points
          name="defaultMaterial001_cell035"
          geometry={nodes.defaultMaterial001_cell035.geometry}
          material={shaderMaterial}
          position={[-0.133, -1.083, -2.059]}
        />
        <points
          name="defaultMaterial001_cell036"
          geometry={nodes.defaultMaterial001_cell036.geometry}
          material={shaderMaterial}
          position={[0.619, -0.515, -0.728]}
        />
        <points
          name="defaultMaterial001_cell037"
          geometry={nodes.defaultMaterial001_cell037.geometry}
          material={shaderMaterial}
          position={[1.085, -1.206, -1.668]}
        />
        <points
          name="defaultMaterial001_cell038"
          geometry={nodes.defaultMaterial001_cell038.geometry}
          material={shaderMaterial}
          position={[-0.443, -1.45, -2.162]}
        />
        <points
          name="defaultMaterial001_cell039"
          geometry={nodes.defaultMaterial001_cell039.geometry}
          material={shaderMaterial}
          position={[-0.196, -1.281, -2.161]}
        />
        <points
          name="defaultMaterial001_cell040"
          geometry={nodes.defaultMaterial001_cell040.geometry}
          material={shaderMaterial}
          position={[-0.093, -0.831, -1.94]}
        />
        <points
          name="defaultMaterial001_cell041"
          geometry={nodes.defaultMaterial001_cell041.geometry}
          material={shaderMaterial}
          position={[0.01, -0.607, -0.791]}
        />
        <points
          name="defaultMaterial001_cell042"
          geometry={nodes.defaultMaterial001_cell042.geometry}
          material={shaderMaterial}
          position={[-0.455, -1.276, -2.183]}
        />
        <points
          name="defaultMaterial001_cell043"
          geometry={nodes.defaultMaterial001_cell043.geometry}
          material={shaderMaterial}
          position={[-0.907, -0.854, -1.643]}
        />
        <points
          name="defaultMaterial001_cell044"
          geometry={nodes.defaultMaterial001_cell044.geometry}
          material={shaderMaterial}
          position={[-1.107, -1.309, -1.597]}
        />
        <points
          name="defaultMaterial001_cell045"
          geometry={nodes.defaultMaterial001_cell045.geometry}
          material={shaderMaterial}
          position={[-0.545, -1.528, -1.103]}
        />
        <points
          name="defaultMaterial001_cell046"
          geometry={nodes.defaultMaterial001_cell046.geometry}
          material={shaderMaterial}
          position={[-0.217, -1.282, -1.081]}
        />
        <points
          name="defaultMaterial001_cell047"
          geometry={nodes.defaultMaterial001_cell047.geometry}
          material={shaderMaterial}
          position={[0.878, -1.146, -0.67]}
        />
        <points
          name="defaultMaterial001_cell048"
          geometry={nodes.defaultMaterial001_cell048.geometry}
          material={shaderMaterial}
          position={[-0.837, -1.14, -1.947]}
        />
        <points
          name="defaultMaterial001_cell049"
          geometry={nodes.defaultMaterial001_cell049.geometry}
          material={shaderMaterial}
          position={[0.34, -1.204, -2.159]}
        />
        <points
          name="defaultMaterial001_cell050"
          geometry={nodes.defaultMaterial001_cell050.geometry}
          material={shaderMaterial}
          position={[-0.125, -1.413, -1.219]}
        />
        <points
          name="defaultMaterial001_cell051"
          geometry={nodes.defaultMaterial001_cell051.geometry}
          material={shaderMaterial}
          position={[-0.89, -0.512, -0.84]}
        />
        <points
          name="defaultMaterial001_cell052"
          geometry={nodes.defaultMaterial001_cell052.geometry}
          material={shaderMaterial}
          position={[-0.354, -1.141, -2.09]}
        />
        <points
          name="defaultMaterial001_cell053"
          geometry={nodes.defaultMaterial001_cell053.geometry}
          material={shaderMaterial}
          position={[-0.093, -1.537, -1.904]}
        />
        <points
          name="defaultMaterial001_cell054"
          geometry={nodes.defaultMaterial001_cell054.geometry}
          material={shaderMaterial}
          position={[0.592, -1.297, -0.775]}
        />
        <points
          name="defaultMaterial001_cell055"
          geometry={nodes.defaultMaterial001_cell055.geometry}
          material={shaderMaterial}
          position={[0.067, -0.521, -1.721]}
        />
        <points
          name="defaultMaterial001_cell056"
          geometry={nodes.defaultMaterial001_cell056.geometry}
          material={shaderMaterial}
          position={[0.852, -0.299, -1.107]}
        />
        <points
          name="defaultMaterial001_cell057"
          geometry={nodes.defaultMaterial001_cell057.geometry}
          material={shaderMaterial}
          position={[-0.082, -1.371, -2.147]}
        />
        <points
          name="defaultMaterial_cell"
          geometry={nodes.defaultMaterial_cell.geometry}
          material={shaderMaterial}
          position={[-0.103, -1.801, 0.126]}
        />
        <points
          name="defaultMaterial_cell001"
          geometry={nodes.defaultMaterial_cell001.geometry}
          material={shaderMaterial}
          position={[-0.214, -1.659, 0.206]}
        />
        <points
          name="defaultMaterial_cell002"
          geometry={nodes.defaultMaterial_cell002.geometry}
          material={shaderMaterial}
          position={[0.11, -2.068, -0.29]}
        />
        <points
          name="defaultMaterial_cell003"
          geometry={nodes.defaultMaterial_cell003.geometry}
          material={shaderMaterial}
          position={[0.22, -1.654, 0.195]}
        />
        <points
          name="defaultMaterial_cell004"
          geometry={nodes.defaultMaterial_cell004.geometry}
          material={shaderMaterial}
          position={[-0.14, -1.627, 0.314]}
        />
        <points
          name="defaultMaterial_cell005"
          geometry={nodes.defaultMaterial_cell005.geometry}
          material={shaderMaterial}
          position={[-0.149, -1.165, 0.415]}
        />
        <points
          name="defaultMaterial_cell006"
          geometry={nodes.defaultMaterial_cell006.geometry}
          material={shaderMaterial}
          position={[-0.172, -2.011, -0.268]}
        />
        <points
          name="defaultMaterial_cell007"
          geometry={nodes.defaultMaterial_cell007.geometry}
          material={shaderMaterial}
          position={[-0.257, -2.089, -0.531]}
        />
        <points
          name="defaultMaterial_cell008"
          geometry={nodes.defaultMaterial_cell008.geometry}
          material={shaderMaterial}
          position={[0.033, -2.715, -1.238]}
        />
        <points
          name="defaultMaterial_cell009"
          geometry={nodes.defaultMaterial_cell009.geometry}
          material={shaderMaterial}
          position={[0.12, -1.064, -0.144]}
        />
        <points
          name="defaultMaterial_cell010"
          geometry={nodes.defaultMaterial_cell010.geometry}
          material={shaderMaterial}
          position={[-0.205, -2.066, -0.936]}
        />
        <points
          name="defaultMaterial_cell011"
          geometry={nodes.defaultMaterial_cell011.geometry}
          material={shaderMaterial}
          position={[-0.406, -1.252, 0.109]}
        />
        <points
          name="defaultMaterial_cell012"
          geometry={nodes.defaultMaterial_cell012.geometry}
          material={shaderMaterial}
          position={[0.155, -1.711, 0.232]}
        />
        <points
          name="defaultMaterial_cell013"
          geometry={nodes.defaultMaterial_cell013.geometry}
          material={shaderMaterial}
          position={[0.048, -1.486, 0.377]}
        />
        <points
          name="defaultMaterial_cell014"
          geometry={nodes.defaultMaterial_cell014.geometry}
          material={shaderMaterial}
          position={[-0.093, -2.298, -0.475]}
        />
        <points
          name="defaultMaterial_cell015"
          geometry={nodes.defaultMaterial_cell015.geometry}
          material={shaderMaterial}
          position={[0.124, -1.078, 0.384]}
        />
        <points
          name="defaultMaterial_cell016"
          geometry={nodes.defaultMaterial_cell016.geometry}
          material={shaderMaterial}
          position={[-0.447, -1.362, 0.043]}
        />
        <points
          name="defaultMaterial_cell017"
          geometry={nodes.defaultMaterial_cell017.geometry}
          material={shaderMaterial}
          position={[-0.115, -1.896, -0.013]}
        />
        <points
          name="defaultMaterial_cell018"
          geometry={nodes.defaultMaterial_cell018.geometry}
          material={shaderMaterial}
          position={[0.05, -2.706, -1.51]}
        />
        <points
          name="defaultMaterial_cell019"
          geometry={nodes.defaultMaterial_cell019.geometry}
          material={shaderMaterial}
          position={[-0.416, -1.25, -0.073]}
        />
        <points
          name="defaultMaterial_cell020"
          geometry={nodes.defaultMaterial_cell020.geometry}
          material={shaderMaterial}
          position={[0.117, -2.228, -1.101]}
        />
        <points
          name="defaultMaterial_cell021"
          geometry={nodes.defaultMaterial_cell021.geometry}
          material={shaderMaterial}
          position={[0.176, -1.842, -0.062]}
        />
        <points
          name="defaultMaterial_cell022"
          geometry={nodes.defaultMaterial_cell022.geometry}
          material={shaderMaterial}
          position={[0.337, -1.457, 0.041]}
        />
        <points
          name="defaultMaterial_cell023"
          geometry={nodes.defaultMaterial_cell023.geometry}
          material={shaderMaterial}
          position={[-0.261, -1.515, 0.292]}
        />
        <points
          name="defaultMaterial_cell024"
          geometry={nodes.defaultMaterial_cell024.geometry}
          material={shaderMaterial}
          position={[-0.262, -1.342, 0.328]}
        />
        <points
          name="defaultMaterial_cell025"
          geometry={nodes.defaultMaterial_cell025.geometry}
          material={shaderMaterial}
          position={[-0.343, -1.523, -0.026]}
        />
        <points
          name="defaultMaterial_cell026"
          geometry={nodes.defaultMaterial_cell026.geometry}
          material={shaderMaterial}
          position={[0.253, -1.36, 0.349]}
        />
        <points
          name="defaultMaterial_cell027"
          geometry={nodes.defaultMaterial_cell027.geometry}
          material={shaderMaterial}
          position={[-0.327, -1.133, -0.471]}
        />
        <points
          name="defaultMaterial_cell028"
          geometry={nodes.defaultMaterial_cell028.geometry}
          material={shaderMaterial}
          position={[-0.277, -1.753, -0.486]}
        />
        <points
          name="defaultMaterial_cell029"
          geometry={nodes.defaultMaterial_cell029.geometry}
          material={shaderMaterial}
          position={[0.159, -2.317, -0.689]}
        />
        <points
          name="defaultMaterial_cell030"
          geometry={nodes.defaultMaterial_cell030.geometry}
          material={shaderMaterial}
          position={[-0.13, -2.836, -1.363]}
        />
        <points
          name="defaultMaterial_cell031"
          geometry={nodes.defaultMaterial_cell031.geometry}
          material={shaderMaterial}
          position={[0.035, -2.905, -1.478]}
        />
        <points
          name="defaultMaterial_cell032"
          geometry={nodes.defaultMaterial_cell032.geometry}
          material={shaderMaterial}
          position={[0.336, -1.706, -0.072]}
        />
        <points
          name="defaultMaterial_cell033"
          geometry={nodes.defaultMaterial_cell033.geometry}
          material={shaderMaterial}
          position={[0.333, -1.591, -0.194]}
        />
        <points
          name="defaultMaterial_cell034"
          geometry={nodes.defaultMaterial_cell034.geometry}
          material={shaderMaterial}
          position={[0.379, -1.08, -0.525]}
        />
        <points
          name="defaultMaterial_cell035"
          geometry={nodes.defaultMaterial_cell035.geometry}
          material={shaderMaterial}
          position={[-0.363, -1.414, 0.168]}
        />
        <points
          name="defaultMaterial_cell036"
          geometry={nodes.defaultMaterial_cell036.geometry}
          material={shaderMaterial}
          position={[0.378, -1.434, -0.484]}
        />
        <points
          name="defaultMaterial_cell037"
          geometry={nodes.defaultMaterial_cell037.geometry}
          material={shaderMaterial}
          position={[-0.28, -1.709, 0.083]}
        />
        <points
          name="defaultMaterial_cell038"
          geometry={nodes.defaultMaterial_cell038.geometry}
          material={shaderMaterial}
          position={[-0.103, -1.496, 0.328]}
        />
        <points
          name="defaultMaterial_cell039"
          geometry={nodes.defaultMaterial_cell039.geometry}
          material={shaderMaterial}
          position={[0.273, -1.888, -0.431]}
        />
        <points
          name="defaultMaterial_cell040"
          geometry={nodes.defaultMaterial_cell040.geometry}
          material={shaderMaterial}
          position={[-0.033, -2.587, -1.047]}
        />
        <points
          name="defaultMaterial_cell041"
          geometry={nodes.defaultMaterial_cell041.geometry}
          material={shaderMaterial}
          position={[0.313, -1.608, -0.315]}
        />
        <points
          name="defaultMaterial_cell042"
          geometry={nodes.defaultMaterial_cell042.geometry}
          material={shaderMaterial}
          position={[-0.335, -1.127, 0.317]}
        />
        <points
          name="defaultMaterial_cell043"
          geometry={nodes.defaultMaterial_cell043.geometry}
          material={shaderMaterial}
          position={[-0.425, -1.448, 0.022]}
        />
        <points
          name="defaultMaterial_cell044"
          geometry={nodes.defaultMaterial_cell044.geometry}
          material={shaderMaterial}
          position={[-0.346, -1.114, 0.178]}
        />
        <points
          name="defaultMaterial_cell045"
          geometry={nodes.defaultMaterial_cell045.geometry}
          material={shaderMaterial}
          position={[0.129, -1.769, -0.76]}
        />
        <points
          name="defaultMaterial_cell046"
          geometry={nodes.defaultMaterial_cell046.geometry}
          material={shaderMaterial}
          position={[-0.251, -2.143, -0.793]}
        />
        <points
          name="defaultMaterial_cell047"
          geometry={nodes.defaultMaterial_cell047.geometry}
          material={shaderMaterial}
          position={[-0.305, -1.686, -0.208]}
        />
        <points
          name="defaultMaterial_cell048"
          geometry={nodes.defaultMaterial_cell048.geometry}
          material={shaderMaterial}
          position={[0.314, -1.558, 0.188]}
        />
        <points
          name="defaultMaterial_cell049"
          geometry={nodes.defaultMaterial_cell049.geometry}
          material={shaderMaterial}
          position={[0.463, -1.292, -0.288]}
        />
        <points
          name="defaultMaterial_cell050"
          geometry={nodes.defaultMaterial_cell050.geometry}
          material={shaderMaterial}
          position={[0.223, -2.107, -0.585]}
        />
        <points
          name="defaultMaterial_cell051"
          geometry={nodes.defaultMaterial_cell051.geometry}
          material={shaderMaterial}
          position={[0.06, -1.748, 0.237]}
        />
        <points
          name="defaultMaterial_cell052"
          geometry={nodes.defaultMaterial_cell052.geometry}
          material={shaderMaterial}
          position={[0.128, -1.396, 0.376]}
        />
        <points
          name="defaultMaterial_cell053"
          geometry={nodes.defaultMaterial_cell053.geometry}
          material={shaderMaterial}
          position={[-0.209, -2.368, -0.721]}
        />
        <points
          name="defaultMaterial_cell054"
          geometry={nodes.defaultMaterial_cell054.geometry}
          material={shaderMaterial}
          position={[0.409, -1.434, -0.058]}
        />
        <points
          name="defaultMaterial_cell055"
          geometry={nodes.defaultMaterial_cell055.geometry}
          material={shaderMaterial}
          position={[-0.202, -2.118, -0.37]}
        />
        <points
          name="defaultMaterial_cell056"
          geometry={nodes.defaultMaterial_cell056.geometry}
          material={shaderMaterial}
          position={[0.066, -1.254, -0.686]}
        />
        <points
          name="defaultMaterial_cell057"
          geometry={nodes.defaultMaterial_cell057.geometry}
          material={shaderMaterial}
          position={[-0.386, -1.4, -0.29]}
        />
        <points
          name="defaultMaterial002_cell002"
          geometry={nodes.defaultMaterial002_cell002.geometry}
          material={shaderMaterial}
          position={[-0.711, 1.436, 1.688]}
        />
        <points
          name="defaultMaterial002_cell003"
          geometry={nodes.defaultMaterial002_cell003.geometry}
          material={shaderMaterial}
          position={[0.084, -0.596, -1.029]}
        />
        <points
          name="defaultMaterial002_cell005"
          geometry={nodes.defaultMaterial002_cell005.geometry}
          material={shaderMaterial}
          position={[0.163, -0.563, 1.005]}
        />
        <points
          name="defaultMaterial002_cell006"
          geometry={nodes.defaultMaterial002_cell006.geometry}
          material={shaderMaterial}
          position={[0.25, 0.022, 2.496]}
        />
        <points
          name="defaultMaterial002_cell007"
          geometry={nodes.defaultMaterial002_cell007.geometry}
          material={shaderMaterial}
          position={[-1.296, 1.376, 1.038]}
        />
        <points
          name="defaultMaterial002_cell009"
          geometry={nodes.defaultMaterial002_cell009.geometry}
          material={shaderMaterial}
          position={[-0.644, -0.763, 1.577]}
        />
        <points
          name="defaultMaterial002_cell011"
          geometry={nodes.defaultMaterial002_cell011.geometry}
          material={shaderMaterial}
          position={[0.985, 1.432, 1.413]}
        />
        <points
          name="defaultMaterial002_cell014"
          geometry={nodes.defaultMaterial002_cell014.geometry}
          material={shaderMaterial}
          position={[-2.083, -0.076, -0.417]}
        />
        <points
          name="defaultMaterial002_cell017"
          geometry={nodes.defaultMaterial002_cell017.geometry}
          material={shaderMaterial}
          position={[0.946, 0.906, 1.993]}
        />
        <points
          name="defaultMaterial002_cell018"
          geometry={nodes.defaultMaterial002_cell018.geometry}
          material={shaderMaterial}
          position={[0.932, 1.125, 2.034]}
        />
        <points
          name="defaultMaterial002_cell020"
          geometry={nodes.defaultMaterial002_cell020.geometry}
          material={shaderMaterial}
          position={[0.946, -1.058, -0.708]}
        />
        <points
          name="defaultMaterial002_cell022"
          geometry={nodes.defaultMaterial002_cell022.geometry}
          material={shaderMaterial}
          position={[0.102, -0.502, -0.554]}
        />
        <points
          name="defaultMaterial002_cell023"
          geometry={nodes.defaultMaterial002_cell023.geometry}
          material={shaderMaterial}
          position={[-0.979, 1.736, 0.286]}
        />
        <points
          name="defaultMaterial002_cell024"
          geometry={nodes.defaultMaterial002_cell024.geometry}
          material={shaderMaterial}
          position={[0.088, -0.162, -1.324]}
        />
        <points
          name="defaultMaterial002_cell025"
          geometry={nodes.defaultMaterial002_cell025.geometry}
          material={shaderMaterial}
          position={[1.042, 0.252, 2.141]}
        />
        <points
          name="defaultMaterial002_cell027"
          geometry={nodes.defaultMaterial002_cell027.geometry}
          material={shaderMaterial}
          position={[-0.426, 1.212, 1.924]}
        />
        <points
          name="defaultMaterial002_cell030"
          geometry={nodes.defaultMaterial002_cell030.geometry}
          material={shaderMaterial}
          position={[-1.193, 1.185, -1.57]}
        />
        <points
          name="defaultMaterial002_cell033"
          geometry={nodes.defaultMaterial002_cell033.geometry}
          material={shaderMaterial}
          position={[0.617, 1.066, -2.179]}
        />
        <points
          name="defaultMaterial002_cell034"
          geometry={nodes.defaultMaterial002_cell034.geometry}
          material={shaderMaterial}
          position={[0.118, -0.373, 2.382]}
        />
        <points
          name="defaultMaterial002_cell035"
          geometry={nodes.defaultMaterial002_cell035.geometry}
          material={shaderMaterial}
          position={[1.736, 0.988, -0.71]}
        />
        <points
          name="defaultMaterial002_cell037"
          geometry={nodes.defaultMaterial002_cell037.geometry}
          material={shaderMaterial}
          position={[1.232, 1.558, -0.863]}
        />
        <points
          name="defaultMaterial002_cell038"
          geometry={nodes.defaultMaterial002_cell038.geometry}
          material={shaderMaterial}
          position={[0.187, -0.669, 0.118]}
        />
        <points
          name="defaultMaterial002_cell040"
          geometry={nodes.defaultMaterial002_cell040.geometry}
          material={shaderMaterial}
          position={[0.317, -0.787, -0.995]}
        />
        <points
          name="defaultMaterial002_cell041"
          geometry={nodes.defaultMaterial002_cell041.geometry}
          material={shaderMaterial}
          position={[0.96, -0.942, -1.42]}
        />
        <points
          name="defaultMaterial002_cell043"
          geometry={nodes.defaultMaterial002_cell043.geometry}
          material={shaderMaterial}
          position={[1.081, -1.311, 0.035]}
        />
        <points
          name="defaultMaterial002_cell045"
          geometry={nodes.defaultMaterial002_cell045.geometry}
          material={shaderMaterial}
          position={[1.371, 0.843, 1.839]}
        />
        <points
          name="defaultMaterial002_cell053"
          geometry={nodes.defaultMaterial002_cell053.geometry}
          material={shaderMaterial}
          position={[-1.316, -1.106, -0.429]}
        />
        <points
          name="defaultMaterial002_cell057"
          geometry={nodes.defaultMaterial002_cell057.geometry}
          material={shaderMaterial}
          position={[-0.705, 1.393, -1.844]}
        />
        <points
          name="defaultMaterial002_cell058"
          geometry={nodes.defaultMaterial002_cell058.geometry}
          material={shaderMaterial}
          position={[-0.781, 1.831, -0.705]}
        />
        <points
          name="defaultMaterial002_cell059"
          geometry={nodes.defaultMaterial002_cell059.geometry}
          material={shaderMaterial}
          position={[0.645, 1.89, 0.342]}
        />
        <points
          name="defaultMaterial002_cell060"
          geometry={nodes.defaultMaterial002_cell060.geometry}
          material={shaderMaterial}
          position={[1.116, 1.285, 1.669]}
        />
        <points
          name="defaultMaterial002_cell061"
          geometry={nodes.defaultMaterial002_cell061.geometry}
          material={shaderMaterial}
          position={[-0.657, 0.71, -2.398]}
        />
        <points
          name="defaultMaterial002_cell062"
          geometry={nodes.defaultMaterial002_cell062.geometry}
          material={shaderMaterial}
          position={[-0.198, -0.611, -2.103]}
        />
        <points
          name="defaultMaterial002_cell067"
          geometry={nodes.defaultMaterial002_cell067.geometry}
          material={shaderMaterial}
          position={[0.482, 1.286, 1.966]}
        />
        <points
          name="defaultMaterial002_cell068"
          geometry={nodes.defaultMaterial002_cell068.geometry}
          material={shaderMaterial}
          position={[-1.644, -0.941, 0.615]}
        />
        <points
          name="defaultMaterial002_cell070"
          geometry={nodes.defaultMaterial002_cell070.geometry}
          material={shaderMaterial}
          position={[0.082, 0.676, 2.132]}
        />
        <points
          name="defaultMaterial002_cell071"
          geometry={nodes.defaultMaterial002_cell071.geometry}
          material={shaderMaterial}
          position={[0.555, 0.809, 2.35]}
        />
        <points
          name="defaultMaterial002_cell072"
          geometry={nodes.defaultMaterial002_cell072.geometry}
          material={shaderMaterial}
          position={[-0.606, -0.021, -2.679]}
        />
        <points
          name="defaultMaterial002_cell073"
          geometry={nodes.defaultMaterial002_cell073.geometry}
          material={shaderMaterial}
          position={[-0.1, 0.568, -0.276]}
        />
        <points
          name="defaultMaterial002_cell074"
          geometry={nodes.defaultMaterial002_cell074.geometry}
          material={shaderMaterial}
          position={[0.44, 1.871, -0.14]}
        />
        <points
          name="defaultMaterial002_cell077"
          geometry={nodes.defaultMaterial002_cell077.geometry}
          material={shaderMaterial}
          position={[-0.093, 0.479, -2.116]}
        />
        <points
          name="defaultMaterial002_cell079"
          geometry={nodes.defaultMaterial002_cell079.geometry}
          material={shaderMaterial}
          position={[-0.987, -0.755, -2.293]}
        />
        <points
          name="defaultMaterial002_cell080"
          geometry={nodes.defaultMaterial002_cell080.geometry}
          material={shaderMaterial}
          position={[1.282, 1.576, 0.323]}
        />
        <points
          name="defaultMaterial002_cell001"
          geometry={nodes.defaultMaterial002_cell001.geometry}
          material={shaderMaterial}
          position={[-0.361, -0.757, -1.248]}
        />
        <points
          name="defaultMaterial002_cell004"
          geometry={nodes.defaultMaterial002_cell004.geometry}
          material={shaderMaterial}
          position={[-0.098, -0.454, 1.091]}
        />
        <points
          name="defaultMaterial002_cell008"
          geometry={nodes.defaultMaterial002_cell008.geometry}
          material={shaderMaterial}
          position={[-0.104, 0.181, 2.451]}
        />
        <points
          name="defaultMaterial002_cell010"
          geometry={nodes.defaultMaterial002_cell010.geometry}
          material={shaderMaterial}
          position={[-0.36, -0.702, -0.69]}
        />
        <points
          name="defaultMaterial002_cell012"
          geometry={nodes.defaultMaterial002_cell012.geometry}
          material={shaderMaterial}
          position={[-0.108, -0.073, -1.321]}
        />
        <points
          name="defaultMaterial002_cell015"
          geometry={nodes.defaultMaterial002_cell015.geometry}
          material={shaderMaterial}
          position={[-0.018, 1.154, -2.05]}
        />
        <points
          name="defaultMaterial002_cell016"
          geometry={nodes.defaultMaterial002_cell016.geometry}
          material={shaderMaterial}
          position={[-0.355, -0.103, 2.505]}
        />
        <points
          name="defaultMaterial002_cell019"
          geometry={nodes.defaultMaterial002_cell019.geometry}
          material={shaderMaterial}
          position={[-0.157, -0.613, 0.1]}
        />
        <points
          name="defaultMaterial002_cell021"
          geometry={nodes.defaultMaterial002_cell021.geometry}
          material={shaderMaterial}
          position={[0.172, -0.639, -2.155]}
        />
        <points
          name="defaultMaterial002_cell026"
          geometry={nodes.defaultMaterial002_cell026.geometry}
          material={shaderMaterial}
          position={[-0.199, 0.615, 2.245]}
        />
        <points
          name="defaultMaterial002_cell028"
          geometry={nodes.defaultMaterial002_cell028.geometry}
          material={shaderMaterial}
          position={[0.121, 0.545, -0.282]}
        />
        <points
          name="defaultMaterial002_cell029"
          geometry={nodes.defaultMaterial002_cell029.geometry}
          material={shaderMaterial}
          position={[-0.182, 1.96, 0.248]}
        />
        <points
          name="defaultMaterial002_cell031"
          geometry={nodes.defaultMaterial002_cell031.geometry}
          material={shaderMaterial}
          position={[-0.159, 1.967, -0.278]}
        />
        <points
          name="defaultMaterial002_cell032"
          geometry={nodes.defaultMaterial002_cell032.geometry}
          material={shaderMaterial}
          position={[0.096, 0.352, -2.215]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/brainfinal.glb");
