import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { StrengthConditioningForm } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  FormControl,
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, X, Edit, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";

const INJURY_TYPES = [
  { value: "sprain", label: "Sprain" },
  { value: "strain", label: "Strain" },
  { value: "fracture", label: "Fracture" },
  { value: "dislocation", label: "Dislocation" },
  { value: "tear", label: "Tear" },
  { value: "concussion", label: "Concussion" },
  { value: "other", label: "Other" },
];

const BODY_LOCATIONS = [
  { value: "head", label: "Head" },
  { value: "neck", label: "Neck" },
  { value: "shoulder", label: "Shoulder" },
  { value: "arm", label: "Arm" },
  { value: "elbow", label: "Elbow" },
  { value: "wrist", label: "Wrist" },
  { value: "hand", label: "Hand" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "abdomen", label: "Abdomen" },
  { value: "hip", label: "Hip" },
  { value: "groin", label: "Groin" },
  { value: "thigh", label: "Thigh" },
  { value: "knee", label: "Knee" },
  { value: "calf", label: "Calf" },
  { value: "ankle", label: "Ankle" },
  { value: "foot", label: "Foot" },
];

const CONCUSSION_SEVERITY = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

type InjuryFormProps = {
  setShowLegacyField: (show: boolean) => void;
};

export const InjuryTrackingForm = ({ setShowLegacyField }: InjuryFormProps) => {
  const [activeTab, setActiveTab] = useState("currentInjuries");
  const [isAddingInjury, setIsAddingInjury] = useState(false);
  const [isAddingSurgery, setIsAddingSurgery] = useState(false);
  const [isAddingConcussion, setIsAddingConcussion] = useState(false);
  
  const form = useFormContext<StrengthConditioningForm>();
  
  const { fields: currentInjuries, append: appendInjury, remove: removeInjury } = 
    useFieldArray({ control: form.control, name: "currentInjuries" });
    
  const { fields: pastSurgeries, append: appendSurgery, remove: removeSurgery } = 
    useFieldArray({ control: form.control, name: "pastSurgeries" });
    
  const { fields: concussionHistory, append: appendConcussion, remove: removeConcussion } = 
    useFieldArray({ control: form.control, name: "concussionHistory" });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mt-6">Medical & Injury History</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Your injury history helps us create safe and personalized training plans.
        This information is confidential and will only be used to customize your experience.
      </p>
      
      {/* Legacy field toggler */}
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox 
          id="use-legacy-field" 
          onCheckedChange={(checked) => setShowLegacyField(!!checked)} 
        />
        <Label htmlFor="use-legacy-field">
          Use simple text field instead (legacy mode)
        </Label>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="currentInjuries">Current Injuries</TabsTrigger>
          <TabsTrigger value="surgeries">Past Surgeries</TabsTrigger>
          <TabsTrigger value="concussions">Concussion History</TabsTrigger>
        </TabsList>
        
        {/* Current Injuries Tab */}
        <TabsContent value="currentInjuries" className="space-y-4">
          {currentInjuries.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground">No current injuries recorded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentInjuries.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {form.getValues(`currentInjuries.${index}.type`)} - {form.getValues(`currentInjuries.${index}.location`)}
                      </CardTitle>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeInjury(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Date: {new Date(form.getValues(`currentInjuries.${index}.date`)).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm">
                      <span>Status:</span>
                      <span className={form.getValues(`currentInjuries.${index}.fullyRecovered`) ? "text-green-600" : "text-amber-600"}>
                        {form.getValues(`currentInjuries.${index}.fullyRecovered`) ? "Fully Recovered" : "Still Recovering"}
                      </span>
                    </div>
                    {form.getValues(`currentInjuries.${index}.treatmentNotes`) && (
                      <p className="text-sm mt-2">{form.getValues(`currentInjuries.${index}.treatmentNotes`)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Dialog open={isAddingInjury} onOpenChange={setIsAddingInjury}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2" onClick={() => setIsAddingInjury(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Injury
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Current Injury</DialogTitle>
                <DialogDescription>
                  Record details about your current or recent injury.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="injury-type">Injury Type</Label>
                    <Select onValueChange={(value) => form.setValue("tempInjuryType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INJURY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="injury-location">Location</Label>
                    <Select onValueChange={(value) => form.setValue("tempInjuryLocation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_LOCATIONS.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="injury-date">Date of Injury</Label>
                  <Input 
                    id="injury-date" 
                    type="date"
                    onChange={(e) => form.setValue("tempInjuryDate", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fully-recovered" 
                    onCheckedChange={(checked) => 
                      form.setValue("tempInjuryRecovered", checked === true)
                    }
                  />
                  <Label htmlFor="fully-recovered">Fully recovered</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="treatment-notes">Treatment Notes (Optional)</Label>
                  <Textarea 
                    id="treatment-notes" 
                    placeholder="Physical therapy, medication, etc."
                    onChange={(e) => form.setValue("tempInjuryNotes", e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingInjury(false)}>Cancel</Button>
                <Button onClick={() => {
                  appendInjury({
                    type: form.getValues("tempInjuryType") || "Unknown",
                    location: form.getValues("tempInjuryLocation") || "Unknown",
                    date: form.getValues("tempInjuryDate") || new Date().toISOString().split('T')[0],
                    fullyRecovered: form.getValues("tempInjuryRecovered") || false,
                    treatmentNotes: form.getValues("tempInjuryNotes") || ""
                  });
                  setIsAddingInjury(false);
                }}>Add Injury</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Past Surgeries Tab */}
        <TabsContent value="surgeries" className="space-y-4">
          {pastSurgeries.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground">No surgeries recorded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastSurgeries.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {form.getValues(`pastSurgeries.${index}.type`)}
                      </CardTitle>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeSurgery(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Date: {new Date(form.getValues(`pastSurgeries.${index}.date`)).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {form.getValues(`pastSurgeries.${index}.notes`) && (
                      <p className="text-sm">{form.getValues(`pastSurgeries.${index}.notes`)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Dialog open={isAddingSurgery} onOpenChange={setIsAddingSurgery}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2" onClick={() => setIsAddingSurgery(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Surgery
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Past Surgery</DialogTitle>
                <DialogDescription>
                  Record details about past surgical procedures.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="surgery-type">Surgery Type/Description</Label>
                  <Input 
                    id="surgery-type" 
                    placeholder="ACL Reconstruction, Shoulder Surgery, etc."
                    onChange={(e) => form.setValue("tempSurgeryType", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="surgery-date">Date of Surgery</Label>
                  <Input 
                    id="surgery-date" 
                    type="date"
                    onChange={(e) => form.setValue("tempSurgeryDate", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="surgery-notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="surgery-notes" 
                    placeholder="Recovery period, limitations, etc."
                    onChange={(e) => form.setValue("tempSurgeryNotes", e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingSurgery(false)}>Cancel</Button>
                <Button onClick={() => {
                  appendSurgery({
                    type: form.getValues("tempSurgeryType") || "Unknown Surgery",
                    date: form.getValues("tempSurgeryDate") || new Date().toISOString().split('T')[0],
                    notes: form.getValues("tempSurgeryNotes") || ""
                  });
                  setIsAddingSurgery(false);
                }}>Add Surgery</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Concussion History Tab */}
        <TabsContent value="concussions" className="space-y-4">
          {concussionHistory.length === 0 ? (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground">No concussion history recorded</p>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-amber-500 h-5 w-5" />
                <p className="text-sm font-medium text-amber-600">{concussionHistory.length} concussion(s) recorded</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concussionHistory.map((field, index) => (
                  <Card key={field.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {form.getValues(`concussionHistory.${index}.severity`)} Concussion
                        </CardTitle>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeConcussion(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Date: {new Date(form.getValues(`concussionHistory.${index}.date`)).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {form.getValues(`concussionHistory.${index}.returnToPlayDays`) && (
                        <div className="text-sm">
                          Return to play: {form.getValues(`concussionHistory.${index}.returnToPlayDays`)} days
                        </div>
                      )}
                      {form.getValues(`concussionHistory.${index}.notes`) && (
                        <p className="text-sm mt-1">{form.getValues(`concussionHistory.${index}.notes`)}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          <Dialog open={isAddingConcussion} onOpenChange={setIsAddingConcussion}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-2" onClick={() => setIsAddingConcussion(true)}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Concussion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Concussion History</DialogTitle>
                <DialogDescription>
                  Tracking concussion history is important for player safety.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="concussion-date">Date of Concussion</Label>
                  <Input 
                    id="concussion-date" 
                    type="date"
                    onChange={(e) => form.setValue("tempConcussionDate", e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="concussion-severity">Severity</Label>
                  <Select onValueChange={(value) => form.setValue("tempConcussionSeverity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONCUSSION_SEVERITY.map((severity) => (
                        <SelectItem key={severity.value} value={severity.value}>
                          {severity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="return-to-play">Days Until Return to Play</Label>
                  <Input 
                    id="return-to-play" 
                    type="number"
                    placeholder="Number of days"
                    min={0}
                    onChange={(e) => form.setValue("tempConcussionReturn", parseInt(e.target.value) || undefined)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="concussion-notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="concussion-notes" 
                    placeholder="Symptoms, treatment, etc."
                    onChange={(e) => form.setValue("tempConcussionNotes", e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingConcussion(false)}>Cancel</Button>
                <Button onClick={() => {
                  appendConcussion({
                    date: form.getValues("tempConcussionDate") || new Date().toISOString().split('T')[0],
                    severity: form.getValues("tempConcussionSeverity") || "moderate",
                    returnToPlayDays: form.getValues("tempConcussionReturn"),
                    notes: form.getValues("tempConcussionNotes") || ""
                  });
                  setIsAddingConcussion(false);
                }}>Add Concussion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-2 mt-4">
        <FormField
          control={form.control}
          name="medicalClearance"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I have medical clearance to participate in football activities
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you confirm you have been cleared by a medical professional
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="medicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional medical information that coaches or trainers should know"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};