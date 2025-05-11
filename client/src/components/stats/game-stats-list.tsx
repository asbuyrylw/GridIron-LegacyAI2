import { useState } from "react";
import { PlusCircle, Edit, Trash, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { format } from "date-fns";
import type { z } from "zod";
import { gameStatsSchema } from "./game-stats-form";

type GameStats = z.infer<typeof gameStatsSchema> & { id: number };

interface GameStatsListProps {
  stats: GameStats[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export default function GameStatsList({ stats, onEdit, onDelete, onAdd }: GameStatsListProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  
  // Group stats by season
  const statsBySeason = stats.reduce((acc, stat) => {
    const season = stat.season;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(stat);
    return acc;
  }, {} as Record<number, GameStats[]>);
  
  // Sort seasons in descending order (most recent first)
  const seasons = Object.keys(statsBySeason)
    .map(Number)
    .sort((a, b) => b - a);
  
  const toggleSeason = (season: number) => {
    setExpandedSeason(expandedSeason === season ? null : season);
  };
  
  // Helper function to calculate completion percentage
  const getCompletionPercentage = (completions: number, attempts: number) => {
    if (attempts === 0) return 0;
    return Math.round((completions / attempts) * 100);
  };
  
  // Helper to get position category
  const getPositionCategory = (position: string) => {
    const offensivePositions = ["Quarterback", "Running Back", "Wide Receiver", "Tight End", "Offensive Tackle", "Offensive Guard", "Center", "Fullback"];
    const defensivePositions = ["Defensive Tackle", "Defensive End", "Linebacker", "Middle Linebacker", "Outside Linebacker", "Cornerback", "Safety", "Free Safety", "Strong Safety"];
    const specialTeamsPositions = ["Kicker", "Punter", "Long Snapper", "Kick Returner", "Punt Returner"];
    
    for (const pos of offensivePositions) {
      if (position.includes(pos)) return "offensive";
    }
    
    for (const pos of defensivePositions) {
      if (position.includes(pos)) return "defensive";
    }
    
    for (const pos of specialTeamsPositions) {
      if (position.includes(pos)) return "special";
    }
    
    return "offensive"; // Default to offensive
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Game Stats by Season</h2>
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" /> Add Season Stats
          </Button>
        )}
      </div>
      
      {seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No Game Stats Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Track your performance by adding game statistics for each season you play.
          </p>
          {onAdd && (
            <Button onClick={onAdd} className="mt-4">
              Add Your First Season
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {seasons.map(season => (
            <Card key={season} className={expandedSeason === season ? "border-primary" : ""}>
              <CardHeader 
                className="cursor-pointer flex flex-row items-center justify-between p-4"
                onClick={() => toggleSeason(season)}
              >
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {season} Season
                    {statsBySeason[season].some(stat => 
                      (stat.passingYards && stat.passingYards > 1000) || 
                      (stat.rushingYards && stat.rushingYards > 500) || 
                      (stat.receivingYards && stat.receivingYards > 500) ||
                      (stat.tackles && stat.tackles > 50)
                    ) && (
                      <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                        Standout Season
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {statsBySeason[season].length} position{statsBySeason[season].length > 1 ? 's' : ''} tracked
                  </CardDescription>
                </div>
                {expandedSeason === season ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardHeader>
              
              {expandedSeason === season && (
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {statsBySeason[season].map(stat => (
                        <div key={stat.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{stat.position}</h3>
                            <div className="flex items-center gap-2">
                              {onEdit && (
                                <Button variant="ghost" size="icon" onClick={() => onEdit(stat.id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button variant="ghost" size="icon" onClick={() => onDelete(stat.id)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm mb-2">
                            <span className="font-medium">Games:</span> {stat.gamesPlayed} played, {stat.gamesStarted} started
                          </div>
                          
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-none">
                              <AccordionTrigger className="py-2 hover:no-underline">
                                <span className="text-sm font-medium">View Stats</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                {getPositionCategory(stat.position) === "offensive" && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {stat.passingYards > 0 && (
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium">Passing</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                          <div><span className="text-muted-foreground">Yards:</span> {stat.passingYards}</div>
                                          <div><span className="text-muted-foreground">TDs:</span> {stat.passingTouchdowns}</div>
                                          <div>
                                            <span className="text-muted-foreground">Comp/Att:</span> {stat.passingCompletions}/{stat.passingAttempts}
                                            {stat.passingAttempts > 0 && (
                                              <span className="text-xs ml-1">
                                                ({getCompletionPercentage(stat.passingCompletions, stat.passingAttempts)}%)
                                              </span>
                                            )}
                                          </div>
                                          <div><span className="text-muted-foreground">INTs:</span> {stat.passingInterceptions}</div>
                                        </div>
                                        <Separator className="my-2" />
                                      </div>
                                    )}
                                    
                                    {stat.rushingYards > 0 && (
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium">Rushing</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                          <div><span className="text-muted-foreground">Yards:</span> {stat.rushingYards}</div>
                                          <div><span className="text-muted-foreground">Attempts:</span> {stat.rushingAttempts}</div>
                                          <div><span className="text-muted-foreground">TDs:</span> {stat.rushingTouchdowns}</div>
                                          {stat.rushingAttempts > 0 && (
                                            <div>
                                              <span className="text-muted-foreground">Avg:</span> {(stat.rushingYards / stat.rushingAttempts).toFixed(1)} yds/carry
                                            </div>
                                          )}
                                        </div>
                                        <Separator className="my-2" />
                                      </div>
                                    )}
                                    
                                    {stat.receivingYards > 0 && (
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium">Receiving</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                          <div><span className="text-muted-foreground">Yards:</span> {stat.receivingYards}</div>
                                          <div><span className="text-muted-foreground">Receptions:</span> {stat.receivingReceptions}</div>
                                          <div><span className="text-muted-foreground">TDs:</span> {stat.receivingTouchdowns}</div>
                                          <div><span className="text-muted-foreground">Targets:</span> {stat.receivingTargets}</div>
                                          {stat.receivingReceptions > 0 && (
                                            <div>
                                              <span className="text-muted-foreground">Avg:</span> {(stat.receivingYards / stat.receivingReceptions).toFixed(1)} yds/catch
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {getPositionCategory(stat.position) === "defensive" && (
                                  <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-medium">Tackles</h4>
                                      <div className="grid grid-cols-2 gap-1 text-sm">
                                        <div><span className="text-muted-foreground">Total:</span> {stat.tackles}</div>
                                        <div><span className="text-muted-foreground">Solo:</span> {stat.soloTackles}</div>
                                        <div><span className="text-muted-foreground">Assisted:</span> {stat.assistedTackles}</div>
                                        <div><span className="text-muted-foreground">TFL:</span> {stat.tacklesForLoss}</div>
                                        <div><span className="text-muted-foreground">Sacks:</span> {stat.sacks}</div>
                                      </div>
                                      <Separator className="my-2" />
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-medium">Coverage & Turnovers</h4>
                                      <div className="grid grid-cols-2 gap-1 text-sm">
                                        <div><span className="text-muted-foreground">INTs:</span> {stat.interceptions}</div>
                                        <div><span className="text-muted-foreground">PD:</span> {stat.passesDefended}</div>
                                        <div><span className="text-muted-foreground">FF:</span> {stat.forcedFumbles}</div>
                                        <div><span className="text-muted-foreground">FR:</span> {stat.fumbleRecoveries}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {getPositionCategory(stat.position) === "special" && (
                                  <div className="grid grid-cols-1 gap-3">
                                    {(stat.fieldGoalsMade > 0 || stat.fieldGoalsAttempted > 0 || 
                                      stat.extraPointsMade > 0 || stat.extraPointsAttempted > 0) && (
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium">Kicking</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">FG:</span> {stat.fieldGoalsMade}/{stat.fieldGoalsAttempted}
                                            {stat.fieldGoalsAttempted > 0 && (
                                              <span className="text-xs ml-1">
                                                ({Math.round((stat.fieldGoalsMade / stat.fieldGoalsAttempted) * 100)}%)
                                              </span>
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">XP:</span> {stat.extraPointsMade}/{stat.extraPointsAttempted}
                                            {stat.extraPointsAttempted > 0 && (
                                              <span className="text-xs ml-1">
                                                ({Math.round((stat.extraPointsMade / stat.extraPointsAttempted) * 100)}%)
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <Separator className="my-2" />
                                      </div>
                                    )}
                                    
                                    {(stat.puntingYards > 0 || stat.puntingAttempts > 0) && (
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-medium">Punting</h4>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                          <div><span className="text-muted-foreground">Punts:</span> {stat.puntingAttempts}</div>
                                          <div><span className="text-muted-foreground">Yards:</span> {stat.puntingYards}</div>
                                          {stat.puntingAttempts > 0 && (
                                            <div>
                                              <span className="text-muted-foreground">Avg:</span> {(stat.puntingYards / stat.puntingAttempts).toFixed(1)} yds/punt
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {stat.notes && (
                                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                                    <span className="font-medium">Notes:</span> {stat.notes}
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
              
              <CardFooter className={expandedSeason === season ? "visible" : "hidden"}>
                <div className="w-full flex justify-end">
                  {onAdd && (
                    <Button 
                      variant="outline" 
                      onClick={onAdd}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Add Position Stats
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}