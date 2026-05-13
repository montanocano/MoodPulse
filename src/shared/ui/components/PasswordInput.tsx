import { useState } from "react";
import { TextInput, TouchableOpacity, type TextInputProps } from "react-native";
import { useTheme, View } from "tamagui";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  borderColor?: string;
}

export function PasswordInput({
  borderColor,
  style,
  ...props
}: PasswordInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View
      borderWidth={1}
      borderColor={(borderColor ?? theme.borderColor?.val) as string}
      borderRadius="$md"
      backgroundColor="$input"
      paddingHorizontal="$space.md"
      height={44}
      flexDirection="row"
      alignItems="center"
    >
      <TextInput
        secureTextEntry={!visible}
        placeholderTextColor={theme.placeholderColor?.val as string}
        style={[
          {
            color: theme.color?.val as string,
            fontSize: 16,
            flex: 1,
          },
          style,
        ]}
        {...props}
      />
      <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8}>
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={20}
          color={theme.placeholderColor?.val as string}
        />
      </TouchableOpacity>
    </View>
  );
}
