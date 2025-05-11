import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the schema for game stats form
const gameStatsSchema = z.object({
  season: z.number().min(2000).max(2050),
  position: z.string().min(1, "Position is required"),
  
  // General stats
  gamesPlayed: z.number().min(0),
  gamesStarted: z.number().min(0),
  
  // Offensive stats
  passingYards: z.number().min(0).optional(),
  passingTouchdowns: z.number().min(0).optional(),
  passingCompletions: z.number().min(0).optional(),
  passingAttempts: z.number().min(0).optional(),
  passingInterceptions: z.number().min(0).optional(),
  
  rushingYards: z.number().min(0).optional(),
  rushingAttempts: z.number().min(0).optional(),
  rushingTouchdowns: z.number().min(0).optional(),
  
  receivingYards: z.number().min(0).optional(),
  receivingReceptions: z.number().min(0).optional(),
  receivingTouchdowns: z.number().min(0).optional(),
  receivingTargets: z.number().min(0).optional(),
  
  // Defensive stats
  tackles: z.number().min(0).optional(),
  soloTackles: z.number().min(0).optional(),
  assistedTackles: z.number().min(0).optional(),
  tacklesForLoss: z.number().min(0).optional(),
  sacks: z.number().min(0).optional(),
  interceptions: z.number().min(0).optional(),
  passesDefended: z.number().min(0).optional(),
  forcedFumbles: z.number().min(0).optional(),
  fumbleRecoveries: z.number().min(0).optional(),
  
  // Special teams stats
  fieldGoalsMade: z.number().min(0).optional(),
  fieldGoalsAttempted: z.number().min(0).optional(),
  extraPointsMade: z.number().min(0).optional(),
  extraPointsAttempted: z.number().min(0).optional(),
  puntingYards: z.number().min(0).optional(),
  puntingAttempts: z.number().min(0).optional(),
  
  notes: z.string().optional(),
});

type GameStats = z.infer<typeof gameStatsSchema>;

interface GameStatsFormProps {
  onSubmit: (data: GameStats) => void;
  initialData?: Partial<GameStats>;
}

export default function GameStatsForm({ onSubmit, initialData }: GameStatsFormProps) {
  const [activePosition, setActivePosition] = useState(initialData?.position || "");
  
  const form = useForm<GameStats>({
    resolver: zodResolver(gameStatsSchema),
    defaultValues: {
      season: initialData?.season || new Date().getFullYear(),
      position: initialData?.position || "",
      gamesPlayed: initialData?.gamesPlayed || 0,
      gamesStarted: initialData?.gamesStarted || 0,
      
      // Offensive stats
      passingYards: initialData?.passingYards || 0,
      passingTouchdowns: initialData?.passingTouchdowns || 0,
      passingCompletions: initialData?.passingCompletions || 0,
      passingAttempts: initialData?.passingAttempts || 0,
      passingInterceptions: initialData?.passingInterceptions || 0,
      
      rushingYards: initialData?.rushingYards || 0,
      rushingAttempts: initialData?.rushingAttempts || 0,
      rushingTouchdowns: initialData?.rushingTouchdowns || 0,
      
      receivingYards: initialData?.receivingYards || 0,
      receivingReceptions: initialData?.receivingReceptions || 0,
      receivingTouchdowns: initialData?.receivingTouchdowns || 0,
      receivingTargets: initialData?.receivingTargets || 0,
      
      // Defensive stats
      tackles: initialData?.tackles || 0,
      soloTackles: initialData?.soloTackles || 0,
      assistedTackles: initialData?.assistedTackles || 0,
      tacklesForLoss: initialData?.tacklesForLoss || 0,
      sacks: initialData?.sacks || 0,
      interceptions: initialData?.interceptions || 0,
      passesDefended: initialData?.passesDefended || 0,
      forcedFumbles: initialData?.forcedFumbles || 0,
      fumbleRecoveries: initialData?.fumbleRecoveries || 0,
      
      // Special teams stats
      fieldGoalsMade: initialData?.fieldGoalsMade || 0,
      fieldGoalsAttempted: initialData?.fieldGoalsAttempted || 0,
      extraPointsMade: initialData?.extraPointsMade || 0,
      extraPointsAttempted: initialData?.extraPointsAttempted || 0,
      puntingYards: initialData?.puntingYards || 0,
      puntingAttempts: initialData?.puntingAttempts || 0,
      
      notes: initialData?.notes || "",
    },
  });
  
  // Football positions with groups
  const positions = {
    "Offense": [
      "Quarterback (QB)",
      "Running Back (RB)",
      "Wide Receiver (WR)",
      "Tight End (TE)",
      "Offensive Tackle (OT)",
      "Offensive Guard (OG)",
      "Center (C)",
      "Fullback (FB)",
    ],
    "Defense": [
      "Defensive Tackle (DT)",
      "Defensive End (DE)",
      "Linebacker (LB)",
      "Middle Linebacker (MLB)",
      "Outside Linebacker (OLB)",
      "Cornerback (CB)",
      "Safety (S)",
      "Free Safety (FS)",
      "Strong Safety (SS)",
    ],
    "Special Teams": [
      "Kicker (K)",
      "Punter (P)",
      "Long Snapper (LS)",
      "Kick Returner (KR)",
      "Punt Returner (PR)",
    ],
  };
  
  const handleSubmit = (data: GameStats) => {
    onSubmit(data);
  };
  
  const handlePositionChange = (position: string) => {
    form.setValue("position", position);
    setActivePosition(position);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
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
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      handlePositionChange(value);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(positions).map(([group, positionList]) => (
                          <div key={group}>
                            <div className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                              {group}
                            </div>
                            {positionList.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="gamesPlayed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Games Played</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gamesStarted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Games Started</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="offensive" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="offensive">Offensive Stats</TabsTrigger>
            <TabsTrigger value="defensive">Defensive Stats</TabsTrigger>
            <TabsTrigger value="special">Special Teams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offensive">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Passing Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="passingYards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Yards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passingTouchdowns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing TDs</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="passingCompletions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passingAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passingInterceptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interceptions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-6">Rushing Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="rushingYards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rushing Yards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rushingAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rushing Attempts</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rushingTouchdowns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rushing TDs</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-6">Receiving Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="receivingYards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receiving Yards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="receivingReceptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receptions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="receivingTouchdowns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receiving TDs</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="receivingTargets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Targets</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="defensive">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Tackle Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="tackles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Tackles</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="soloTackles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Solo Tackles</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="assistedTackles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assisted Tackles</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="tacklesForLoss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tackles For Loss</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sacks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sacks</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Coverage Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="interceptions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interceptions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="passesDefended"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passes Defended</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="forcedFumbles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forced Fumbles</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fumbleRecoveries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fumble Recoveries</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="special">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Kicking Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="fieldGoalsMade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Goals Made</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fieldGoalsAttempted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field Goals Attempted</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="extraPointsMade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Points Made</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="extraPointsAttempted"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Extra Points Attempted</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="text-lg font-semibold mb-4">Punting Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="puntingYards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punting Yards</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="puntingAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punting Attempts</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea 
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Add any additional notes or highlights from the season"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Include noteworthy achievements or context about the season's statistics
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit">Save Game Stats</Button>
        </div>
      </form>
    </Form>
  );
}