import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { footballInfoSchema, FootballInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { POSITIONS, TEAM_LEVELS } from "@/lib/constants";

interface FootballInfoFormProps {
  onSubmit: (data: { footballInfo: FootballInfo }) => void;
  prevStep: () => void;
  initialData?: FootballInfo;
}

export default function FootballInfoForm({ onSubmit, prevStep, initialData }: FootballInfoFormProps) {
  const form = useForm<FootballInfo>({
    resolver: zodResolver(footballInfoSchema),
    defaultValues: initialData || {
      yearsPlayed: 0,
      position: "",
      secondaryPositions: [],
      teamLevel: "",
      captainLeadershipRoles: "",
    },
  });

  const handleSubmit = (data: FootballInfo) => {
    onSubmit({ footballInfo: data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Football Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your football experience. This helps us customize your training and development plans.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="yearsPlayed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years Playing Football</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="3" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Position</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POSITIONS.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Secondary Positions (Optional)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {POSITIONS.map((position) => (
                <FormField
                  key={position.value}
                  control={form.control}
                  name="secondaryPositions"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={position.value}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(position.value)}
                            onCheckedChange={(checked) => {
                              const updatedValues = checked
                                ? [...(field.value || []), position.value]
                                : field.value?.filter(
                                    (value) => value !== position.value
                                  ) || [];
                              field.onChange(updatedValues);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {position.label}
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
            name="teamLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Team Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current team level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TEAM_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
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
            name="captainLeadershipRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Captain/Leadership Roles (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Team captain, Special teams captain, Leadership council, etc." 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={prevStep}>
              Previous
            </Button>
            <Button type="submit">
              Next: Athletic Metrics
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}