"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { 
  Menu, X, Play, Maximize, Smartphone, Shield, 
  ChevronRight, CheckCircle, Monitor, Layers, Eye, Move, Zap, Rotate3d
} from 'lucide-react';

// Importaciones estándar unificadas para evitar colisiones de dependencias
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, useGLTF } from '@react-three/drei';

// URL del modelo 3D del Porsche Carrera 4S (estática y altamente optimizada)
const MODEL_URL = 'models/porsche_911.gltf';

// Pre-cargamos el modelo 3D a nivel de módulo para una respuesta instantánea
try {
  useGLTF.preload(MODEL_URL);
} catch (e) {
  console.error("Error pre-cargando el modelo:", e);
}

// ==========================================================
// COMPONENTE MODELO 3D (DEFINIDO GLOBALMENTE)
// Esto evita que React desmonte el coche al actualizar estados
// ==========================================================
function CarModel({ color }) {
  const { scene } = useGLTF(MODEL_URL);
  
  // Clonamos la escena una única vez al cargar para evitar robos de referencia
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Actualizamos el color del material de manera reactiva y súper fluida
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        const matName = child.material.name.toLowerCase();
        const meshName = child.name.toLowerCase();
        
        // Identificamos las partes de la carrocería del Porsche
        if (
          meshName.includes('body') || 
          meshName.includes('paint') || 
          meshName.includes('carpaint') ||
          matName.includes('paint') ||
          matName.includes('body') ||
          matName.includes('paint')
        ) {
          // Clonamos el material de forma aislada para esta pintura
          child.material = child.material.clone();
          child.material.color.set(color);
          child.material.roughness = 0.12; // Acabado de laca brillante
          child.material.metalness = 0.85; // Reflejos metálicos realistas de alta gama
        }
      }
    });
  }, [clonedScene, color]);

  return <primitive object={clonedScene} scale={1.4} position={[0, -0.6, 0]} />;
}

// ==========================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ==========================================================
export default function AutofixerApp() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCarColor, setActiveCarColor] = useState('#171717'); // Color inicial: Negro Mate
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Filtro inteligente para silenciar los logs de deprecación en desarrollo
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && (
        typeof args[0] === 'string' && (
          args[0].includes('THREE.Clock') || 
          args[0].includes('PCFSoftShadowMap') ||
          args[0].includes('touch-action')
        )
      )) {
        return; 
      }
      originalWarn(...args);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.warn = originalWarn;
    };
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setMousePosition({ x, y });
  };

  const carColors = [
    { name: 'Negro Mate', hex: '#171717', bg: 'bg-neutral-900' },
    { name: 'Plata Metálico', hex: '#a3a3a3', bg: 'bg-neutral-400' },
    { name: 'Blanco Nieve', hex: '#f5f5f5', bg: 'bg-neutral-100' },
  ];

  return (
    <div 
      className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans selection:bg-black selection:text-white relative"
      onMouseMove={handleMouseMove}
    >
      {/* Patrón de puntos sutil estilo Teenage Engineering / NOTHING */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-neutral-200 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/Autofixer.PNG" 
              alt="Autofixer" 
              className="h-8 md:h-10 object-contain mix-blend-multiply"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="hidden text-2xl font-light tracking-widest uppercase">Autofixer</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide uppercase">
            <a href="#features" className="hover:text-neutral-500 transition-colors">Características</a>
            <a href="#showcase" className="hover:text-neutral-500 transition-colors">Catálogo</a>
            <a href="#pricing" className="hover:text-neutral-500 transition-colors">Planes</a>
            <button className="px-5 py-2 bg-black text-white rounded-full hover:bg-neutral-800 transition-all font-semibold">
              Obtener App
            </button>
          </div>

          <button className="md:hidden text-neutral-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col space-y-6 md:hidden">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-light border-b border-neutral-100 pb-4">Características</a>
          <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-light border-b border-neutral-100 pb-4">Catálogo</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-light border-b border-neutral-100 pb-4">Planes</a>
          <button className="w-full py-4 bg-black text-white rounded-full text-lg font-medium mt-4">
            Descargar Autofixer
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden z-10 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            <div className="w-full md:w-1/2 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-300 bg-white text-xs font-mono font-medium tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                Autofixer OS v1.0
              </div>
              <h1 className="text-5xl md:text-7xl font-light leading-[1.1] tracking-tight">
                Míralo.<br />
                <span className="font-semibold">Siéntelo.</span><br />
                Cómpralo.
              </h1>
              <p className="text-lg text-neutral-600 max-w-md leading-relaxed">
                Experimenta vehículos de lujo en realidad virtual y aumentada antes de tomar tu próxima gran decisión. El futuro de la compra automotriz.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-neutral-800 transition-all font-medium">
                  Explorar Demo <ChevronRight size={18} />
                </button>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-neutral-300 text-neutral-900 rounded-full hover:bg-neutral-50 transition-all font-medium">
                  <Play size={18} fill="currentColor" /> Ver Experiencia
                </button>
              </div>
            </div>

            {/* HERO VISUAL - Industrial CAD Style con animación interactiva */}
            <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px]">
              <div 
                className="absolute inset-0 bg-white border border-neutral-200 rounded-[2rem] shadow-sm flex items-center justify-center overflow-hidden"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * -0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                
                {/* SVG Interactivo simulando vector 3D Wireframe */}
                <svg viewBox="0 0 800 400" className="w-full h-full p-8 text-neutral-900 drop-shadow-md z-10 transition-colors duration-500">
                  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 150 250 C 120 250, 100 230, 100 200 C 100 170, 150 160, 200 150 C 300 130, 400 100, 500 100 C 600 100, 650 120, 700 160 C 730 180, 750 210, 750 250 L 150 250 Z" />
                    <circle cx="220" cy="250" r="45" />
                    <circle cx="220" cy="250" r="25" />
                    <circle cx="620" cy="250" r="45" />
                    <circle cx="620" cy="250" r="25" />
                    <path d="M 350 150 C 350 120, 400 110, 480 110 C 530 110, 570 130, 590 160 L 350 160 Z" />
                    <path d="M 100 280 L 750 280" strokeDasharray="5,5" strokeWidth="1" stroke="gray" />
                    <text x="425" y="300" textAnchor="middle" fill="gray" stroke="none" className="font-mono text-xs">DISTANCIA ENTRE EJES: 2450mm</text>
                  </g>
                </svg>

                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono font-semibold tracking-widest uppercase">Escáner Activo</span>
                </div>
                <div className="absolute bottom-6 right-6">
                  <span className="text-xs font-mono font-medium text-neutral-500">Renderizando AR_V2</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 bg-white border-y border-neutral-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light mb-6">La búsqueda convencional es obsoleta.</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-lg">
              Fotos en 2D no justifican una inversión premium. Autofixer transforma la navegación web en una experiencia inmersiva e interactiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-neutral-200 rounded-2xl bg-[#fafafa] hover:bg-white hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Maximize size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inmersión VR</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Camina alrededor del auto a escala real. Siente la presencia del vehículo desde la comodidad de tu sala.
              </p>
            </div>

            <div className="p-8 border border-neutral-200 rounded-2xl bg-[#fafafa] hover:bg-white hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Monitor size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Telemetría en Vivo</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Visualiza caballos de fuerza, torque y aceleración a través de una interfaz holográfica dinámica.
              </p>
            </div>

            <div className="p-8 border border-neutral-200 rounded-2xl bg-[#fafafa] hover:bg-white hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-white border border-neutral-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={24} className="text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Realidad Aumentada</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Proyecta el auto en tu propio garaje o entrada utilizando la cámara de tu smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section id="showcase" className="py-32 relative z-10 px-6">
        <div className="container mx-auto max-w-6xl">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="text-xs font-mono font-medium tracking-widest text-neutral-500 uppercase mb-2">Vehículo Destacado</div>
              <h2 className="text-4xl md:text-5xl font-light">Porsche 911 <span className="font-semibold">Carrera 4S</span></h2>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-neutral-500 uppercase text-right">Material / Pintura</span>
              <div className="flex gap-3">
                {carColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setActiveCarColor(color.hex)}
                    className={`w-10 h-10 rounded-full border-2 ${activeCarColor === color.hex ? 'border-black' : 'border-transparent'} p-1 transition-all focus:outline-none`}
                    title={color.name}
                  >
                    <div className={`w-full h-full rounded-full ${color.bg} border border-black/10`}></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visor 3D Principal */}
            <div className="lg:col-span-2 relative w-full h-[500px] md:h-[600px] rounded-[2rem] border border-neutral-200 bg-white flex items-center justify-center overflow-hidden group shadow-sm">
              
              {/* Controles flotantes de la UI del Visor */}
              <div className="absolute top-6 right-6 flex gap-3 z-20">
                <div className="px-3 py-2 bg-[#fafafa]/80 backdrop-blur border border-neutral-200 rounded-full flex items-center gap-2 text-xs font-mono text-neutral-500">
                  <Rotate3d size={14} className="animate-spin" /> Arrastra para rotar
                </div>
              </div>

              {/* CONTENEDOR 3D REAL (React Three Fiber) */}
              <div className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }}>
                {isClient ? (
                  <Suspense fallback={
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-neutral-50">
                      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-mono tracking-widest text-neutral-400">CARGANDO MOTOR GRÁFICO...</span>
                    </div>
                  }>
                    <ThreeDCanvas activeCarColor={activeCarColor} />
                  </Suspense>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-mono text-neutral-400">Iniciando motor gráfico...</span>
                  </div>
                )}
              </div>

              {/* Botón Flotante AR */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <button className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-neutral-800 transition-all shadow-xl text-sm font-medium">
                  <Smartphone size={16} /> Ver en tu espacio
                </button>
              </div>
            </div>

            {/* Panel de Especificaciones */}
            <div className="flex flex-col gap-4">
              <div className="p-6 rounded-2xl border border-neutral-200 bg-white">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6 pb-4 border-b border-neutral-100 flex items-center justify-between">
                  Rendimiento
                  <Zap size={16} className="text-neutral-400" />
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">Potencia</div>
                    <div className="text-3xl font-light">443 <span className="text-sm font-mono text-neutral-400">HP</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">0–100 km/h</div>
                    <div className="text-3xl font-light">3.4 <span className="text-sm font-mono text-neutral-400">SEG</span></div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-1">Velocidad Máxima</div>
                    <div className="text-3xl font-light">305 <span className="text-sm font-mono text-neutral-400">KM/H</span></div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 bg-white flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6 pb-4 border-b border-neutral-100">
                  Especificaciones
                </h3>
                <ul className="space-y-4 font-mono text-sm">
                  <li className="flex justify-between items-center">
                    <span className="text-neutral-500">Motor</span>
                    <span className="text-right">Twin-Turbo Flat-6</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-neutral-500">Tracción</span>
                    <span className="text-right">AWD</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-neutral-500">Peso</span>
                    <span className="text-right">1,565 kg</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="pricing" className="py-24 bg-white border-y border-neutral-200 z-10 relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light mb-4">Acceso a la plataforma.</h2>
            <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">Elige tu licencia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 rounded-2xl border border-neutral-200 bg-[#fafafa] flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Entusiasta</h3>
              <p className="text-neutral-500 text-sm mb-6">Para compradores y amantes de los autos.</p>
              <div className="text-5xl font-light mb-8">Gratis</div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle size={18} className="text-black" /> Showroom VR limitado
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle size={18} className="text-black" /> Previsualización AR (Modelos base)
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle size={18} className="text-black" /> Estadísticas estándar
                </li>
              </ul>
              <button className="w-full py-4 rounded-full border border-black text-black font-medium hover:bg-neutral-100 transition-colors">
                Descargar App
              </button>
            </div>

            <div className="p-10 rounded-2xl border border-black bg-black text-white flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-bl-xl">Pro</div>
              <h3 className="text-2xl font-semibold mb-2">Concesionarios</h3>
              <p className="text-neutral-400 text-sm mb-6">Para ventas e integración de inventario.</p>
              <div className="text-5xl font-light mb-8 font-mono">Personalizado</div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle size={18} className="text-white" /> Showroom VR completo y personalizable
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle size={18} className="text-white" /> Integración de inventario en vivo
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle size={18} className="text-white" /> Analíticas de clientes
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle size={18} className="text-white" /> Soporte de marca blanca
                </li>
              </ul>
              <button className="w-full py-4 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-colors">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER & FINAL CTA */}
      <footer className="pt-32 pb-12 relative z-10 px-6 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-6xl font-light mb-8">
            El futuro de la compra <br className="hidden md:block"/>
            <span className="font-semibold">comienza ahora.</span>
          </h2>
          <div className="flex justify-center mb-24">
            <button className="px-8 py-4 bg-black text-white rounded-full hover:bg-neutral-800 transition-all font-medium text-lg flex items-center gap-2">
              Descargar Autofixer <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-neutral-200 gap-6">
            <div className="flex items-center gap-2">
              <img 
                src="/Autofixer.PNG" 
                alt="Autofixer" 
                className="h-6 object-contain mix-blend-multiply opacity-50"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-xl font-light tracking-widest text-neutral-400 uppercase">Autofixer</span>
            </div>
            <div className="flex gap-6 text-sm text-neutral-500 font-mono uppercase tracking-wider">
              <a href="#" className="hover:text-black transition-colors">Privacidad</a>
              <a href="#" className="hover:text-black transition-colors">Términos</a>
              <a href="#" className="hover:text-black transition-colors">Inversores</a>
            </div>
            <div className="text-sm text-neutral-400 font-mono">
              © {new Date().getFullYear()} Autofixer OS.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================================
// VISOR CANVAS 3D (DEFINIDO GLOBALMENTE)
// ==========================================================
function ThreeDCanvas({ activeCarColor }) {
  return (
    <Canvas 
      shadows
      dpr={[1, 2]} 
      style={{ touchAction: 'none' }}
      camera={{ position: [0, 1.2, 5.5], fov: 40 }}
    >
      <color attach="background" args={['#ffffff']} />
      
      {/* ILUMINACIÓN FIJA DE ESTUDIO DE GRABACIÓN */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 4, 0]} intensity={0.8} />

      <PresentationControls
        global
        config={{ mass: 1, tension: 350, friction: 40 }}
        snap={{ mass: 3, tension: 150, friction: 30 }}
        rotation={[0, 0.5, 0]}
        polar={[-Math.PI / 16, Math.PI / 8]} 
        azimuth={[-Math.PI / 1.2, Math.PI / 1.2]}
      >
        {/* Cuadrícula sutil técnica en el suelo */}
        <gridHelper args={[12, 12, '#000000', '#e5e5e5']} position={[0, -0.6, 0]} opacity={0.3} />
        
        {/* El cargador del modelo 3D estable */}
        <CarModel color={activeCarColor} />
      </PresentationControls>
    </Canvas>
  );
}