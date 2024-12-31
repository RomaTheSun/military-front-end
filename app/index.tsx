import { View } from "react-native";
import LoginScreen from './(unauthenticated)/login';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <LoginScreen />
    </View>
  );
}
