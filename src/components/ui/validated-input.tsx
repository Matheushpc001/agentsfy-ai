
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  touched?: boolean;
  success?: boolean;
  helpText?: string;
  onValidate?: (value: string) => void;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, type, label, error, touched, success, helpText, onValidate, ...props }, ref) => {
    const hasError = touched && error;
    const hasSuccess = touched && success && !error;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onValidate) {
        onValidate(e.target.value);
      }
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={props.id} 
            className={cn(
              hasError && "text-destructive",
              hasSuccess && "text-green-600"
            )}
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            type={type}
            className={cn(
              hasError && "border-destructive focus-visible:ring-destructive",
              hasSuccess && "border-green-500 focus-visible:ring-green-500",
              "pr-10",
              className
            )}
            ref={ref}
            {...props}
            onBlur={handleBlur}
          />
          
          {(hasError || hasSuccess) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {hasError && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              {hasSuccess && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
          )}
        </div>
        
        {hasError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {helpText && !hasError && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };
