import { useState } from "react";
import { Calendar, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, addDays, isSameDay } from "date-fns";

interface PlanEvent {
  id: number;
  date: Date;
  title: string;
  type: "training" | "nutrition" | "recruiting" | "other";
  completed: boolean;
}

export function PlanCalendar() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  // This would come from API - mocked for now
  const events: PlanEvent[] = [
    {
      id: 1,
      date: new Date(),
      title: "Speed Training",
      type: "training",
      completed: false
    },
    {
      id: 2,
      date: new Date(),
      title: "Game Day Meal Prep",
      type: "nutrition",
      completed: true
    },
    {
      id: 3,
      date: addDays(new Date(), 1),
      title: "Email Coach Follow-up",
      type: "recruiting",
      completed: false
    },
    {
      id: 4,
      date: addDays(new Date(), 2),
      title: "Power Development",
      type: "training",
      completed: false
    },
    {
      id: 5,
      date: addDays(new Date(), 4),
      title: "College Research Task",
      type: "recruiting",
      completed: false
    }
  ];
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };
  
  // Navigation functions
  const nextWeek = () => setCurrentWeekDate(addWeeks(currentWeekDate, 1));
  const prevWeek = () => setCurrentWeekDate(subWeeks(currentWeekDate, 1));
  const nextMonth = () => setCurrentMonthDate(addMonths(currentMonthDate, 1));
  const prevMonth = () => setCurrentMonthDate(subMonths(currentMonthDate, 1));
  
  // Generate week days
  const generateWeekDays = () => {
    const startDate = startOfWeek(currentWeekDate);
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      weekDays.push(day);
    }
    
    return weekDays;
  };
  
  // Generate event badge styling
  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "nutrition":
        return "bg-green-100 text-green-800 border-green-300";
      case "recruiting":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  // Render weekly view
  const renderWeeklyView = () => {
    const weekDays = generateWeekDays();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">
            Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={i} 
                className={`border rounded-md p-1 min-h-[80px] text-xs ${
                  isToday ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className={`text-center mb-1 font-medium ${
                  isToday ? 'text-blue-600' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 ? (
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <Popover key={event.id}>
                        <PopoverTrigger asChild>
                          <div className={`cursor-pointer p-1 rounded text-xs truncate border ${
                            getEventBadgeStyle(event.type)
                          } ${event.completed ? 'opacity-60 line-through' : ''}`}>
                            {event.title}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent side="right" className="w-60 p-3">
                          <div className="space-y-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex justify-between">
                              <Badge variant="outline" className="capitalize">
                                {event.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(event.date, 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="pt-2 flex justify-end">
                              <Button size="sm" variant="outline" className="text-xs">
                                {event.completed ? 'Completed' : 'Mark Complete'}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render monthly view
  const renderMonthlyView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">
            {format(currentMonthDate, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="font-medium">{day}</div>
          ))}
        </div>
        
        <div className="text-center py-4">
          <div className="flex justify-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Monthly view will display a full calendar for program tracking.
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Training Calendar</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-0">
            {renderWeeklyView()}
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0">
            {renderMonthlyView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}