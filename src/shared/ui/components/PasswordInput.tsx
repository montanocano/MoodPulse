import { TextInput, type TextInputProps } from "react-native";
import { useTheme, View } from "tamagui";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  borderColor?: string;
}

export function PasswordInput({ borderColor, style, ...props }: PasswordInputProps) {
  const theme = useTheme();

  return (
    <View
      borderWidth={1}
      borderColor={(borderColor ?? theme.borderColor?.val) as string}
      borderRadius="$md"
      backgroundColor="$input"
      paddingHorizontal="$space.md"
      height={44}
      justifyContent="center"
    >
      <TextInput
        secureTextEntry
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
    </View>
  );
}
