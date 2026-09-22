import React from 'react'
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native'

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(function TextInput(props, ref) {
  const {
    value,
    placeholder,
    placeholderTextColor,
    onChangeText,
    
    
    ...rest
  } = props;

  return (
    <RNTextInput
      ref={ref}
      value={value}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      onChangeText={onChangeText}
      style={styles.input}
      {...rest}
    />
  )
})

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'gray',
    padding: 12,
  },
})