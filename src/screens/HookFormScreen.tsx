import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { useForm, Controller, SubmitHandler, type Control, type FieldErrors } from 'react-hook-form';
import { TextInput } from 'components/TextInput';

type FormData = {
  id: number
  firstName: string;
  lastName: string;
  age: string;
}

type FieldProps = {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  name: keyof FormData;
  placeholder: string;
  rules: { required: string };
};

const Field = ({ control, errors, name, placeholder, rules }: FieldProps) => {
  const renderCount = React.useRef(0);
  // eslint-disable-next-line react-hooks/refs
  renderCount.current += 1;

  const error = errors[name];

  return (
    <View style={styles.formGroup}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput onBlur={onBlur} onChangeText={onChange} value={String(value)} placeholder={placeholder} />
        )}
      />
      {/* eslint-disable-next-line react-hooks/refs */}
      <Text style={styles.count}>{`${placeholder} renders: ${renderCount.current}`}</Text>
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
};

export const HookFormScreen = () => {
  const renderCount = React.useRef(0);
  // eslint-disable-next-line react-hooks/refs
  renderCount.current += 1;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      id: 0,
      firstName: '',
      lastName: '',
      age: '',
    }
  })

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(`Form data: ${JSON.stringify(data, null, 2)}`)
  }

  return (
    <View style={styles.container}>
      {/* eslint-disable-next-line react-hooks/refs */}
      <Text>Root renders: {renderCount.current}</Text>
      <View style={styles.form}>
        <Field control={control} errors={errors} name="firstName" placeholder="First Name"
          rules={{ required: 'First name is required' }} />
        <Field control={control} errors={errors} name="lastName" placeholder="Last Name"
          rules={{ required: 'Last name is required' }} />
        <Field control={control} errors={errors} name="age" placeholder="Age"
          rules={{ required: 'Age is required' }} />

        { }
        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 16,
    gap: 12,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  count: {
    fontSize: 11,
    color: 'gray',
  },
  error: {
    color: 'red',
    fontSize: 12,
  }
});
