import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

interface OnboardingCompleteProps {
  onSubmit: () => void;
  prevStep: () => void;
  isPending: boolean;
}

export default function OnboardingComplete({
  onSubmit,
  prevStep,
  isPending,
}: OnboardingCompleteProps) {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">Almost Done!</h2>
          <p className="mt-2 text-muted-foreground">
            You've completed all the steps to set up your athlete profile. Your data will be used to create:
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-primary">Personalized Training Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Based on your current metrics, goals, training history, and recovery capacity,
            we'll create a custom training program with position-specific exercises.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-primary">Nutrition & Supplement Plan</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We'll provide daily calorie goals, macronutrient targets, sample meal plans,
            grocery lists, and hydration and recovery protocols tailored to your needs.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-primary">Recruiting Roadmap</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your recruiting plan will match you with division goals based on your measurables,
            providing milestone checklists and a school contact strategy.
          </p>
        </div>
      </div>
        
      <div className="flex flex-col space-y-2 pt-2">
        <p className="text-sm text-muted-foreground text-center italic">
          The LegacyAI Coach will generate these plans based on your information.
          You can always update your information later from your profile settings.
        </p>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}