import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Film, ImageIcon, Sparkles, Wand2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { BigActionCard } from '../../components/BigActionCard';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'CreateHome'>;

export function CreateHomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  return (
    <Screen>
      <View>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Create</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>Pick how you want to make your next video.</Text>
      </View>
      <View style={styles.grid}>
        <BigActionCard
          title="Generate Video"
          subtitle="Prompt to video"
          icon={<Sparkles size={20} color="#0b0c10" />}
          featured
          onPress={() => navigation.navigate('AIVideoGeneration')}
        />
        <BigActionCard
          title="Image to Video"
          subtitle="Animate a photo"
          icon={<ImageIcon size={18} color={theme.accentAlt} />}
          onPress={() => navigation.navigate('ImageToVideo')}
        />
        <BigActionCard
          title="Reference Video"
          subtitle="Restyle a clip"
          icon={<Film size={18} color={theme.accentAlt} />}
          onPress={() => navigation.navigate('ReferenceVideo')}
        />
        <BigActionCard
          title="Manual Edit"
          subtitle="Trim, filter, export"
          icon={<Wand2 size={18} color={theme.accentAlt} />}
          onPress={() => navigation.navigate('ManualEdit')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between', alignItems: 'flex-start' },
});
