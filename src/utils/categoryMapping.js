import {
  Car,
  AlertTriangle,
  Truck,
  Zap,
  Layout,
  BookOpen,
  Shield,
  Wrench,
  Users,
  Box,
  Eye,
  Smile,
  FileText,
  PlayCircle
} from "lucide-react";

export const CATEGORIES = [
  { id: "signs", label: "Road and traffic signs", icon: Car },
  { id: "incidents", label: "Incidents, accidents and emergencies", icon: AlertTriangle },
  { id: "other_vehicles", label: "Other types of vehicle", icon: Truck },
  { id: "handling", label: "Vehicle handling", icon: Zap },
  { id: "motorway", label: "Motorway rules", icon: Layout },
  { id: "rules", label: "Rules of the road", icon: BookOpen },
  { id: "margins", label: "Safety margins", icon: Shield },
  { id: "vehicle_safety", label: "Safety and your vehicle", icon: Wrench },
  { id: "vulnerable", label: "Vulnerable road users", icon: Users },
  { id: "loading", label: "Vehicle loading", icon: Box },
  { id: "alertness", label: "Alertness", icon: Eye },
  { id: "attitude", label: "Attitude", icon: Smile },
  { id: "documents", label: "Documents", icon: FileText },
  // { id: "videos", label: "Videos", icon: PlayCircle } // Reserved for future
];

export const getDisplayCategory = (oldCategory) => {
  if (!oldCategory) return "Rules of the road"; // Default

  const normalized = oldCategory.toLowerCase();

  // Mapping logic
  if (normalized.includes("sign") || normalized.includes("signal") || normalized.includes("marking") || normalized.includes("light")) return "Road and traffic signs";
  if (normalized.includes("accident") || normalized.includes("emergency") || normalized.includes("crash")) return "Incidents, accidents and emergencies";
  if (normalized.includes("bus") || normalized.includes("truck") || normalized.includes("motorcycle") || normalized.includes("tram")) return "Other types of vehicle";
  if (normalized.includes("control") || normalized.includes("handling") || normalized.includes("skid") || normalized.includes("steering") || normalized.includes("dynamics")) return "Vehicle handling";
  if (normalized.includes("highway") || normalized.includes("motorway") || normalized.includes("lane")) return "Motorway rules";
  if (normalized.includes("rule") || normalized.includes("law") || normalized.includes("priority") || normalized.includes("parking") || normalized.includes("speed")) return "Rules of the road";
  if (normalized.includes("margin") || normalized.includes("distance") || normalized.includes("weather") || normalized.includes("rain") || normalized.includes("ice") || normalized.includes("fog") || normalized.includes("night") || normalized.includes("condition")) return "Safety margins";
  if (normalized.includes("maintenance") || normalized.includes("safety") || normalized.includes("check") || normalized.includes("tire") || normalized.includes("brake") || normalized.includes("system")) return "Safety and your vehicle";
  if (normalized.includes("pedestrian") || normalized.includes("cyclist") || normalized.includes("child") || normalized.includes("vulnerable") || normalized.includes("horse")) return "Vulnerable road users";
  if (normalized.includes("load") || normalized.includes("tow") || normalized.includes("weight")) return "Vehicle loading";
  if (normalized.includes("alert") || normalized.includes("observation") || normalized.includes("tired") || normalized.includes("fatigue") || normalized.includes("distract") || normalized.includes("drug") || normalized.includes("alcohol") || normalized.includes("fitness")) return "Alertness";
  if (normalized.includes("attitude") || normalized.includes("behavior") || normalized.includes("aggressive") || normalized.includes("courtesy")) return "Attitude";
  if (normalized.includes("document") || normalized.includes("licens") || normalized.includes("insur") || normalized.includes("regist")) return "Documents";

  return "Rules of the road"; // Fallback
};
