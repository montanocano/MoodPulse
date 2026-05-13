import { TouchableOpacity } from "react-native";
import { Text, View, useTheme } from "tamagui";
import { EmotionRecord, EMOTION_CONFIG } from "../../../types/emotion";
import { parseISODate } from "../../utils/calendarHelpers";

interface CalendarDayProps {
  date: string | null;
  record?: EmotionRecord;
  isToday: boolean;
  onPress: (date: string) => void;
}

const DOT_SIZE = 28;

export function CalendarDay({
  date,
  record,
  isToday,
  onPress,
}: CalendarDayProps) {
  const theme = useTheme();

  // Padding cell — outside the current month
  if (date === null) {
    return <View width={DOT_SIZE} height={DOT_SIZE + 18} />;
  }

  const dayNumber = parseISODate(date).day;

  if (record) {
    const fillColor = EMOTION_CONFIG[record.emotion].colorValue;
    return (
      <TouchableOpacity
        onPress={() => onPress(date)}
        accessibilityRole="button"
        accessibilityLabel={`${date} - ${EMOTION_CONFIG[record.emotion].label}`}
        style={{ alignItems: "center" }}
      >
        <View
          width={DOT_SIZE}
          height={DOT_SIZE}
          borderRadius="$full"
          backgroundColor={fillColor}
          borderWidth={isToday ? 2 : 0}
          borderColor={isToday ? (theme.primary?.val as string) : undefined}
          alignItems="center"
          justifyContent="center"
        />
        <Text
          fontSize={10}
          color="$color"
          opacity={0.6}
          marginTop={2}
          textAlign="center"
        >
          {dayNumber}
        </Text>
      </TouchableOpacity>
    );
  }

  // Date with no record
  return (
    <View alignItems="center">
      <View
        width={DOT_SIZE}
        height={DOT_SIZE}
        borderRadius="$full"
        backgroundColor="$muted"
        opacity={0.4}
        borderWidth={isToday ? 2 : 0}
        borderColor={isToday ? (theme.primary?.val as string) : undefined}
      />
      <Text
        fontSize={10}
        color="$color"
        opacity={0.4}
        marginTop={2}
        textAlign="center"
      >
        {dayNumber}
      </Text>
    </View>
  );
}
