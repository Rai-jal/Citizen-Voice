import { Tabs } from "expo-router";
import { Home, BarChart3, Bot, Search } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#fff", height: 60 },
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
          tabBarLabel: "Report",
        }}
      />
      <Tabs.Screen
        name="mafaxson"
        options={{
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
          tabBarLabel: "Mafaxson",
        }}
      />
      <Tabs.Screen
        name="fact-check"
        options={{
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          tabBarLabel: "Fact",
        }}
      />
    </Tabs>
  );
}
