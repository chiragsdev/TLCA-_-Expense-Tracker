import { 
  Trophy, 
  Users, 
  UtensilsCrossed, 
  Baby, 
  Music, 
  Camera, 
  FolderOpen,
  Building2
} from "lucide-react";
import { Department } from "../components/AddExpenseDialog";

const defaultIcons: Record<string, React.ReactNode> = {
  Sports: <Trophy className="h-5 w-5" />,
  Fellowship: <Users className="h-5 w-5" />,
  Food: <UtensilsCrossed className="h-5 w-5" />,
  Kids: <Baby className="h-5 w-5" />,
  Worship: <Music className="h-5 w-5" />,
  Media: <Camera className="h-5 w-5" />,
  General: <FolderOpen className="h-5 w-5" />,
};

const defaultColors: Record<string, string> = {
  Sports: "text-blue-600",
  Fellowship: "text-purple-600",
  Food: "text-orange-600",
  Kids: "text-pink-600",
  Worship: "text-indigo-600",
  Media: "text-green-600",
  General: "text-gray-600",
};

const colorList = [
  "text-blue-600",
  "text-purple-600",
  "text-orange-600",
  "text-pink-600",
  "text-indigo-600",
  "text-green-600",
  "text-teal-600",
  "text-red-600",
  "text-yellow-600",
  "text-cyan-600",
];

export function getDepartmentIcon(department: Department): React.ReactNode {
  return defaultIcons[department] || <Building2 className="h-5 w-5" />;
}

export function getDepartmentColor(department: Department, allDepartments?: Department[]): string {
  if (defaultColors[department]) {
    return defaultColors[department];
  }
  
  if (allDepartments) {
    const index = allDepartments.indexOf(department);
    if (index !== -1) {
      return colorList[index % colorList.length];
    }
  }
  
  return "text-gray-600";
}

const badgeColors: Record<string, string> = {
  Sports: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Fellowship: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  Food: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Kids: "bg-pink-100 text-pink-800 hover:bg-pink-100",
  Worship: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  Media: "bg-green-100 text-green-800 hover:bg-green-100",
  General: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const badgeColorList = [
  "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "bg-orange-100 text-orange-800 hover:bg-orange-100",
  "bg-pink-100 text-pink-800 hover:bg-pink-100",
  "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  "bg-green-100 text-green-800 hover:bg-green-100",
  "bg-teal-100 text-teal-800 hover:bg-teal-100",
  "bg-red-100 text-red-800 hover:bg-red-100",
  "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
];

export function getDepartmentBadgeColor(department: Department, allDepartments?: Department[]): string {
  if (badgeColors[department]) {
    return badgeColors[department];
  }
  
  if (allDepartments) {
    const index = allDepartments.indexOf(department);
    if (index !== -1) {
      return badgeColorList[index % badgeColorList.length];
    }
  }
  
  return "bg-gray-100 text-gray-800 hover:bg-gray-100";
}
