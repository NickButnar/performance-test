import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Form, useField, useForm } from 'react-final-form';
import { setIn } from 'final-form';
import { TextInput } from 'components/TextInput';
import { fields, formSchema, initialValues, type FormData } from 'forms';
import {
  BenchPanel,
  count,
  registerInput,
  registerRestart,
  registerSubmit,
  reset,
  unregisterInput,
} from 'benchmark';

type FieldProps = {
  name: keyof FormData;
  placeholder: string;
};

const validate = (values: FormData) => {
  count('schema');

  const result = formSchema.safeParse(values);
  if (result.success) {
    return undefined;
  }

  return result.error.issues.reduce(
    (errors, issue) => setIn(errors, issue.path.join('.'), issue.message),
    {} as object,
  );
};

const Field = ({ name, placeholder }: FieldProps) => {
  count(`field:${name}`);

  const {
    input: { onChange, onBlur, value },
    meta: { error, modified, submitFailed },
  } = useField(name, {
    subscription: { value: true, error: true, modified: true, submitFailed: true },
  });

  const latestOnChange = React.useRef(onChange);

  React.useEffect(() => {
    latestOnChange.current = onChange;
  });

  React.useEffect(() => {
    registerInput(name, (next: string) => latestOnChange.current(next));

    return () => unregisterInput(name);
  }, [name]);

  return (
    <View style={styles.formGroup}>
      <TextInput onBlur={() => onBlur()} onChangeText={onChange} value={String(value)} placeholder={placeholder} />
      <Text style={styles.error} numberOfLines={1}>
        {((modified || submitFailed) && error) || ' '}
      </Text>
    </View>
  );
};

const FormBody = ({ handleSubmit }: { handleSubmit: () => void }) => {
  count('root');

  const form = useForm();

  React.useEffect(() => {
    registerSubmit(handleSubmit);
    registerRestart(() => form.restart(initialValues));
  });

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        {fields.map(({ name, placeholder }) => (
          <Field key={name} name={name} placeholder={placeholder} />
        ))}

        <Button title="Submit" onPress={handleSubmit} />
      </View>

      <BenchPanel />
    </KeyboardAwareScrollView>
  );
};

const onSubmit = () => {};

export const FinalFormScreen = () => {
  React.useState(() => reset('react-final-form'));

  return (
    <Form<FormData>
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={validate}
      subscription={{}}
      render={({ handleSubmit }) => <FormBody handleSubmit={handleSubmit} />}
    />
  )
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 12,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  error: {
    color: 'red',
    fontSize: 12,
    lineHeight: 16,
    minHeight: 16,
  }
});
