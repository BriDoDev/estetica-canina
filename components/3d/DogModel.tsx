'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

interface DogModelProps {
  scrollProgress?: number
}

export function DogModel({ scrollProgress = 0 }: DogModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  const dirtyColor = new THREE.Color('#8B6914')
  const cleanColor = new THREE.Color('#FFF8F0')

  useEffect(() => {
    if (!bodyMaterialRef.current) return

    const targetColor = dirtyColor.clone().lerp(cleanColor, scrollProgress)
    gsap.to(bodyMaterialRef.current.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 0.5,
      ease: 'power2.out',
    })

    const roughness = 0.9 - scrollProgress * 0.6
    gsap.to(bodyMaterialRef.current, {
      roughness,
      duration: 0.5,
    })
  }, [scrollProgress]) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
  })

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Body */}
      <Box args={[1.2, 0.8, 1.8]} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial
          ref={bodyMaterialRef}
          color={dirtyColor}
          roughness={0.9}
          metalness={0}
        />
      </Box>

      {/* Head */}
      <Sphere args={[0.45, 32, 32]} position={[0, 1.1, 0.85]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Sphere>

      {/* Snout */}
      <Box args={[0.3, 0.2, 0.25]} position={[0, 0.95, 1.2]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Box>

      {/* Nose */}
      <Sphere args={[0.07, 16, 16]} position={[0, 1.0, 1.35]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </Sphere>

      {/* Left ear */}
      <Box args={[0.2, 0.35, 0.1]} position={[-0.38, 1.35, 0.8]} rotation={[0, 0, 0.3]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Box>

      {/* Right ear */}
      <Box args={[0.2, 0.35, 0.1]} position={[0.38, 1.35, 0.8]} rotation={[0, 0, -0.3]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Box>

      {/* Front-left leg */}
      <Cylinder args={[0.13, 0.13, 0.8, 16]} position={[-0.4, 0.0, -0.8]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Cylinder>

      {/* Front-right leg */}
      <Cylinder args={[0.13, 0.13, 0.8, 16]} position={[0.4, 0.0, -0.8]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Cylinder>

      {/* Back-left leg */}
      <Cylinder args={[0.13, 0.13, 0.8, 16]} position={[-0.4, 0.0, 0.7]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Cylinder>

      {/* Back-right leg */}
      <Cylinder args={[0.13, 0.13, 0.8, 16]} position={[0.4, 0.0, 0.7]} castShadow>
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Cylinder>

      {/* Tail */}
      <Cylinder
        args={[0.06, 0.04, 0.6, 16]}
        position={[0, 0.9, -1.0]}
        rotation={[0.8, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color={dirtyColor} roughness={0.9} />
      </Cylinder>
    </group>
  )
}
