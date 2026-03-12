import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: ["node_modules/", ".next/", "out/", "scripts/"],
  },
  {
    rules: {
      // Disable overly strict rules - legitimate patterns for this project
      "react-hooks/set-state-in-effect": "off",
      // Math.random() is valid for particle systems, animations, 3D effects
      "react-hooks/purity": "off",
      // Three.js camera/object mutations are intentional and required
      "react-hooks/immutability": "off",
    },
  },
];
