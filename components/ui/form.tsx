import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = React.forwardRef<
  HTMLFormElement,
  React.HTMLAttributes<HTMLFormElement> & {
    children?: React.ReactNode;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  }
>(({ className, onSubmit, children, ...props }, ref) => {
  // Filtrar props de react-hook-form que no deben pasar al elemento form
  const filteredProps = Object.keys(props).reduce(
    (acc, key) => {
      // Excluir props de react-hook-form
      if (
        ![
          "control",
          "handleSubmit",
          "watch",
          "setValue",
          "getValues",
          "reset",
          "resetField",
          "clearErrors",
          "unregister",
          "setError",
          "setFocus",
          "getFieldState",
          "formState",
          "subscribe",
          "trigger",
          "register",
        ].includes(key)
      ) {
        (acc as any)[key] = (props as any)[key];
      }
      return acc;
    },
    {} as typeof props,
  );

  return (
    <form
      ref={ref}
      className={cn("space-y-8", className)}
      onSubmit={onSubmit}
      {...filteredProps}
    >
      {children}
    </form>
  );
});
Form.displayName = "Form";

interface FormContextValue {
  name: string;
}

const FormFieldContext = React.createContext<FormContextValue | undefined>(
  undefined,
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  return fieldContext;
};

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => <Controller {...props} />;
FormField.displayName = "FormField";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn("text-sm font-medium text-gray-900", className)}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />);
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-red-600", className)}
    {...props}
  />
));
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
