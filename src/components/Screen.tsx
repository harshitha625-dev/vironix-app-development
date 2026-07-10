import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export function Screen({ children, scroll = true, style, edges = ['top'] }: Props) {
  const { theme } = useTheme();
  const Wrapper = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.bg }]} edges={edges}>
      <Wrapper
        style={styles.flex}
        contentContainerStyle={scroll ? [styles.content, style] : undefined}
        showsVerticalScrollIndicator={false}
        {...(!scroll ? { } : {})}
      >
        {!scroll ? <View style={[styles.flex, styles.content, style]}>{children}</View> : children}
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 90, gap: 20 },
});
