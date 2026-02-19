import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";

function HumanModel() {
  const { scene } = useGLTF("/swing.glb");
  return <primitive object={scene} />;
}

export default function HumanViewer() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3], fov: 35 }} style={{ width: 420, height: 520 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} color="#2fe6de" />
      <Environment preset="night" />
      <HumanModel />
      <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2.5} far={1.5} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
