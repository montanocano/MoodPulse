import { ActivityIndicator } from "react-native";
import { Button, Text } from "tamagui";

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-filled";

export type AppButtonShape = "pill" | "rounded";
export type AppButtonSize = "sm" | "md" | "lg";

export interface AppButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: AppButtonVariant;
  shape?: AppButtonShape;
  size?: AppButtonSize;
  fullWidth?: boolean;
  flex?: number;
  /** Emotion-specific color — overrides variant colours */
  accentColor?: string;
  opacity?: number;
}

// ── Styles per variant ─────────────────────────────────────────────────────

interface StyleDef {
  bg: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
}

function resolveStyle(
  variant: AppButtonVariant,
  accentColor?: string,
): StyleDef {
  if (accentColor) {
    if (variant === "primary" || variant === "danger-filled") {
      return {
        bg: accentColor,
        borderColor: accentColor,
        textColor: "white",
        borderWidth: 0,
      };
    }
    // secondary / danger outline with emotion colour
    return {
      bg: accentColor + "18",
      borderColor: accentColor,
      textColor: accentColor,
      borderWidth: 1.5,
    };
  }

  switch (variant) {
    case "primary":
      return {
        bg: "$primary",
        borderColor: "$primary",
        textColor: "white",
        borderWidth: 0,
      };
    case "secondary":
      return {
        bg: "$surface",
        borderColor: "$borderColor",
        textColor: "$color",
        borderWidth: 1,
      };
    case "danger":
      return {
        bg: "$surface",
        borderColor: "$emotionAngry",
        textColor: "$emotionAngry",
        borderWidth: 1,
      };
    case "danger-filled":
      return {
        bg: "$emotionAngry",
        borderColor: "$emotionAngry",
        textColor: "white",
        borderWidth: 1,
      };
  }
}

// ── Size props ─────────────────────────────────────────────────────────────

interface SizeProps {
  height?: number;
  fontSize: number;
  fontWeight: "600" | "700";
  paddingHorizontal: string;
  paddingVertical?: string;
}

function resolveSize(size: AppButtonSize): SizeProps {
  switch (size) {
    case "sm":
      return {
        fontSize: 13,
        fontWeight: "600",
        paddingHorizontal: "$space.sm",
        paddingVertical: "$space.xs",
      };
    case "md":
      return {
        fontSize: 14,
        fontWeight: "600",
        paddingHorizontal: "$space.md",
        paddingVertical: "$space.sm",
      };
    case "lg":
      return {
        height: 48,
        fontSize: 15,
        fontWeight: "700",
        paddingHorizontal: "$space.lg",
      };
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  shape = "rounded",
  size = "md",
  fullWidth = false,
  flex,
  accentColor,
  opacity,
}: AppButtonProps) {
  const s = resolveStyle(variant, accentColor);
  const sz = resolveSize(size);
  const borderRadius = shape === "pill" ? 9999 : ("$md" as any);

  return (
    <Button
      onPress={onPress}
      disabled={disabled || loading}
      backgroundColor={s.bg as any}
      borderWidth={s.borderWidth}
      borderColor={s.borderColor as any}
      borderRadius={borderRadius}
      height={sz.height}
      paddingHorizontal={sz.paddingHorizontal as any}
      paddingVertical={sz.paddingVertical as any}
      width={fullWidth ? "100%" : undefined}
      flex={flex}
      opacity={opacity ?? (disabled && !loading ? 0.5 : 1)}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={s.textColor === "white" ? "#fff" : s.textColor}
        />
      ) : (
        <Text
          color={s.textColor as any}
          fontSize={sz.fontSize}
          fontWeight={sz.fontWeight}
          fontFamily="$body"
        >
          {label}
        </Text>
      )}
    </Button>
  );
}
