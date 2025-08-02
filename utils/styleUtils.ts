import { StyleProp } from 'react-native';

/**
 * Safely combines styles, filtering out falsy values that can cause issues in React Native Web
 * @param styles Array of styles or conditional styles
 * @returns Combined style object safe for React Native Web
 */
export function combineStyles<T>(...styles: (StyleProp<T> | false | null | undefined)[]): StyleProp<T> {
  const validStyles = styles.filter(Boolean);
  if (validStyles.length === 0) return {} as StyleProp<T>;
  if (validStyles.length === 1) return validStyles[0] as StyleProp<T>;
  return validStyles as StyleProp<T>;
}