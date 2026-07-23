import { useState } from "react";

export function useTenantTheme() {
  const [branding] = useState({
    name: "e-Vidyalaya",
    fullName: "e-Vidyalaya Platform Engine",
    primaryColor: "#0F1E3D",
    accentColor: "#B8842E",
    backgroundColor: "#F4F6F9",
  });

  return { branding };
}
