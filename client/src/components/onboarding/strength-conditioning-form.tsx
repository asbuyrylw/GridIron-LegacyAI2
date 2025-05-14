import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { strengthConditioningSchema, StrengthConditioningForm as StrengthForm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TRAINING_FOCUS_OPTIONS, 
  AREAS_TO_IMPROVE_OPTIONS, 
  GYM_ACCESS_OPTIONS, 
  RECOVERY_METHOD_OPTIONS,
  PERSONAL_TRAINER_OPTIONS,
  ENERGY_LEVEL_OPTIONS
} from "@/lib/constants";
import { InjuryTrackingForm } from "./injury-tracking-form";
import { Separator } from "@/components/ui/separator";

interface StrengthConditioningFormProps {
  onSubmit: (data: { strengthConditioning: StrengthForm }) => void;
  prevStep: () => void;
  initialData?: StrengthForm;
}

export default function StrengthConditioningForm({
  onSubmit,
  prevStep,
  initialData,
}: StrengthConditioningFormProps) {
  const [showLegacyInjuryField, setShowLegacyInjuryField] = useState(false);
  
  const form = useForm<StrengthForm>({
    resolver: zodResolver(strengthConditioningSchema),
    defaultValues: initialData || {
      yearsTraining: undefined,
      daysPerWeek: undefined,
      trainingFocus: [],
      areasToImprove: [],
      gymAccess: "",
      sleepHours: undefined,
      recoveryMethods: [],
      personalTrainer: "",
      structuredTrainingPlan: false,
      postPracticeRecovery: "",
      energyLevels: "",
      injuriesSurgeries: "",
      currentInjuries: [],
      pastSurgeries: [],
      concussionHistory: [],
      medicalClearance: false,
      medicalNotes: "",
    },
  });

  const handleSubmit = (data: StrengthForm) => {
    onSubmit({ strengthConditioning: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Strength and Conditioning History</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your training experience so we can create a customized strength and conditioning program.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="yearsTraining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Strength Training</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daysPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Per Week Currently Training</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="4"
                      min={0}
                      max={7}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormLabel>Training Focus (Select all that apply)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TRAINING_FOCUS_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="trainingFocus"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), option.value]
                                : field.value?.filter(
                                    (value) => value !== option.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <div className="space-y-3">
            <FormLabel>Areas You Want to Improve (Select all that apply)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AREAS_TO_IMPROVE_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="areasToImprove"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), option.value]
                                : field.value?.filter(
                                    (value) => value !== option.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </div>

          <FormField
            control={form.control}
            name="gymAccess"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access to Gym/Equipment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gym access" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GYM_ACCESS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sleepHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many hours of sleep do you get (average)?</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8"
                    min={0}
                    max={24}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>What do you do for Recovery? (Select all that apply)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {RECOVERY_METHOD_OPTIONS.map((option) => (
                <FormField
                  key={option.value}
                  control={form.control}
                  name="recoveryMethods"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), option.value]
                                : field.value?.filter(
                                    (value) => value !== option.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Training Structure</h3>
            
            <FormField
              control={form.control}
              name="personalTrainer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you work with a personal trainer or strength coach?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your answer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PERSONAL_TRAINER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="structuredTrainingPlan"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Structured Training Plan</FormLabel>
                    <FormDescription>
                      Are you currently following a structured training plan?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postPracticeRecovery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you do to recover after practice?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I foam roll for 10 minutes, stretch, and take an ice bath once a week..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="energyLevels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How would you describe your energy levels throughout the day?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your energy levels" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENERGY_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Injury Tracking */}
          <Separator className="my-4" />
          
          {showLegacyInjuryField ? (
            <FormField
              control={form.control}
              name="injuriesSurgeries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Injuries/Surgeries (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any significant injuries or surgeries that may impact your training"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <InjuryTrackingForm setShowLegacyField={setShowLegacyInjuryField} />
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button type="submit">Next: Nutrition</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}