import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clipboard, 
  Image, 
  AlertTriangle, 
  Share2, 
  Copy, 
  Twitter, 
  Instagram, 
  Share, 
  Facebook,
  FileText,
  Download,
  CheckCircle,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const PlayerBrandingToolkitPage: React.FC = () => {
  const { user, athlete } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bio-generator');
  const [bioLength, setBioLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [bioFocus, setBioFocus] = useState<'athletic' | 'academic' | 'balanced'>('balanced');
  const [generatedBio, setGeneratedBio] = useState<string>('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [profileScoreResult, setProfileScoreResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [socialMediaProfile, setSocialMediaProfile] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [socialCaption, setSocialCaption] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('highlight');
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [showAcademics, setShowAcademics] = useState(true);
  
  // Fetch athlete data including stats, achievements, etc.
  const { data: athleteData, isLoading: isLoadingAthlete } = useQuery({
    queryKey: ['/api/athletes', athlete?.id],
    queryFn: async () => {
      if (!athlete?.id) return null;
      const response = await fetch(`/api/athletes/${athlete.id}`);
      if (!response.ok) throw new Error('Failed to fetch athlete data');
      return response.json();
    },
    enabled: !!athlete?.id,
  });
  
  // Fetch athlete's combine metrics
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/athletes', athlete?.id, 'metrics'],
    queryFn: async () => {
      if (!athlete?.id) return null;
      const response = await fetch(`/api/athletes/${athlete.id}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    enabled: !!athlete?.id,
  });
  
  // Fetch athlete's achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/athletes', athlete?.id, 'achievements'],
    queryFn: async () => {
      if (!athlete?.id) return [];
      const response = await fetch(`/api/athletes/${athlete.id}/achievements`);
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    },
    enabled: !!athlete?.id,
  });

  // Generate athlete bio based on profile data
  const generateBio = async () => {
    if (!athlete?.id) {
      toast({
        title: 'Error',
        description: 'Athlete profile is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGeneratingBio(true);
    
    try {
      const response = await apiRequest('/api/player-branding/generate-bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId: athlete.id,
          length: bioLength,
          focus: bioFocus,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate bio');
      }
      
      const result = await response.json();
      setGeneratedBio(result.bio);
      
      toast({
        title: 'Bio Generated',
        description: 'Your athlete bio has been created successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'An error occurred while generating your bio',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingBio(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Content copied to clipboard',
    });
  };

  // Scan social media profile
  const scanProfile = async () => {
    if (!socialMediaProfile) {
      toast({
        title: 'Input Required',
        description: 'Please enter a social media handle or URL',
        variant: 'destructive',
      });
      return;
    }
    
    setIsScanning(true);
    
    try {
      const response = await apiRequest('/api/player-branding/scan-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId: athlete?.id,
          profileUrl: socialMediaProfile,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scan profile');
      }
      
      const result = await response.json();
      setProfileScoreResult(result);
      
      toast({
        title: 'Scan Complete',
        description: 'Your social media profile has been analyzed',
      });
    } catch (error: any) {
      toast({
        title: 'Scan Failed',
        description: error.message || 'An error occurred during the scan',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Generate social media caption
  const generateCaption = async () => {
    if (!athlete?.id) {
      toast({
        title: 'Error',
        description: 'Athlete profile is required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await apiRequest('/api/player-branding/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId: athlete.id,
          templateType: selectedTemplate,
          customHashtags: customHashtags.split(',').map(tag => tag.trim()),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate caption');
      }
      
      const result = await response.json();
      setSocialCaption(result.caption);
      
      toast({
        title: 'Caption Generated',
        description: 'Your social media caption has been created',
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'An error occurred while generating your caption',
        variant: 'destructive',
      });
    }
  };

  // Generate hashtags based on athlete profile and selected options
  const generateRecommendedHashtags = () => {
    if (!athlete) return '';
    
    const position = athlete.position?.replace(/[()]/g, '').toLowerCase() || '';
    const positionHashtags = position ? [`#${position.replace(/\\s+/g, '')}`] : [];
    const schoolHashtag = athlete.school ? [`#${athlete.school.replace(/\\s+/g, '')}`] : [];
    
    // Add general football hashtags
    const generalHashtags = ['#football', '#athlete', '#gridiron', '#recruit'];
    
    // Combine all hashtags
    return [...positionHashtags, ...schoolHashtag, ...generalHashtags].join(' ');
  };

  // Generate shareable athlete card
  const generateAthleteCard = async () => {
    const element = document.getElementById('athlete-card');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${athlete?.firstName || 'athlete'}_${athlete?.lastName || 'profile'}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Card Generated',
        description: 'Your athlete card has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate athlete card',
        variant: 'destructive',
      });
    }
  };

  // Create PDF profile
  const generatePdfProfile = async () => {
    if (!athlete) return;
    
    try {
      const pdf = new jsPDF();
      
      // Add headers
      pdf.setFontSize(22);
      pdf.text(`${athlete.firstName} ${athlete.lastName}`, 20, 20);
      
      pdf.setFontSize(14);
      pdf.text(`Position: ${athlete.position || 'N/A'}`, 20, 30);
      pdf.text(`School: ${athlete.school || 'N/A'}`, 20, 40);
      
      // Add bio if available
      if (generatedBio) {
        pdf.setFontSize(12);
        pdf.text('Athlete Bio:', 20, 55);
        
        const splitBio = pdf.splitTextToSize(generatedBio, 170);
        pdf.text(splitBio, 20, 65);
      }
      
      // Add metrics if available
      if (metricsData) {
        let yPosition = generatedBio ? 100 : 60;
        
        pdf.setFontSize(16);
        pdf.text('Performance Metrics', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        if (metricsData.fortyYard) pdf.text(`40-Yard Dash: ${metricsData.fortyYard}s`, 20, yPosition += 10);
        if (metricsData.verticalJump) pdf.text(`Vertical Jump: ${metricsData.verticalJump}"`, 20, yPosition += 10);
        if (metricsData.benchPress) pdf.text(`Bench Press: ${metricsData.benchPress} lbs`, 20, yPosition += 10);
        if (metricsData.squatMax) pdf.text(`Squat Max: ${metricsData.squatMax} lbs`, 20, yPosition += 10);
      }
      
      // Save the PDF
      pdf.save(`${athlete.firstName || 'athlete'}_${athlete.lastName || 'profile'}.pdf`);
      
      toast({
        title: 'PDF Generated',
        description: 'Your profile PDF has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate PDF profile',
        variant: 'destructive',
      });
    }
  };

  // Render Bio Generator tab
  const renderBioGenerator = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Athlete Bio Generator</CardTitle>
            <CardDescription>
              Create a professionally written bio based on your profile data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bio-length">Bio Length</Label>
                <Select 
                  value={bioLength} 
                  onValueChange={(value) => setBioLength(value as any)}
                >
                  <SelectTrigger id="bio-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                    <SelectItem value="medium">Medium (1 paragraph)</SelectItem>
                    <SelectItem value="long">Long (2-3 paragraphs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio-focus">Bio Focus</Label>
                <Select 
                  value={bioFocus} 
                  onValueChange={(value) => setBioFocus(value as any)}
                >
                  <SelectTrigger id="bio-focus">
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athletic">Athletic Achievements</SelectItem>
                    <SelectItem value="academic">Academic & Character</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={generateBio} 
              disabled={isGeneratingBio || isLoadingAthlete}
              className="w-full"
            >
              {isGeneratingBio ? 'Generating...' : 'Generate Bio'}
            </Button>
            
            {generatedBio && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-md p-4 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium mb-2">Generated Bio:</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(generatedBio)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  <p className="text-sm">{generatedBio}</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium">Usage Suggestions:</h3>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Add to your recruiting profile</li>
                    <li>Use in social media profiles</li>
                    <li>Include in emails to college coaches</li>
                    <li>Add to your athletic resume</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render social media templates tab
  const renderSocialTemplates = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Social Media Caption Generator</CardTitle>
            <CardDescription>
              Create engaging captions for your highlight posts and game updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-type">Content Type</Label>
              <Select 
                value={selectedTemplate} 
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlight">Highlight Reel</SelectItem>
                  <SelectItem value="gameday">Game Day</SelectItem>
                  <SelectItem value="announcement">College Commitment</SelectItem>
                  <SelectItem value="camp">Camp/Combine</SelectItem>
                  <SelectItem value="training">Training Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-hashtags">
                Custom Hashtags (comma separated)
              </Label>
              <Input
                id="custom-hashtags"
                placeholder="#QB, #recruiting, etc."
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={generateCaption}
              disabled={!athlete?.id}
              className="w-full"
            >
              Generate Caption
            </Button>
            
            {socialCaption && (
              <div className="mt-6 space-y-4">
                <div className="border rounded-md p-4 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium mb-2">Generated Caption:</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(socialCaption)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy to clipboard</span>
                    </Button>
                  </div>
                  <p className="text-sm">{socialCaption}</p>
                </div>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Label>Recommended Hashtags</Label>
              <div className="border rounded-md p-4 bg-muted/50">
                <p className="text-sm">{generateRecommendedHashtags()}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(generateRecommendedHashtags())}
                  className="mt-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  <span>Copy Hashtags</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" className="h-8">
                <Twitter className="h-4 w-4 mr-2" />
                <span>Share to Twitter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Instagram className="h-4 w-4 mr-2" />
                <span>Copy for Instagram</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Facebook className="h-4 w-4 mr-2" />
                <span>Share to Facebook</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render profile scanner tab
  const renderProfileScanner = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clean Profile Scanner</CardTitle>
            <CardDescription>
              Analyze your public social media presence for recruitment readiness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Recruiter Awareness</AlertTitle>
              <AlertDescription>
                College recruiters often check social media profiles as part of their evaluation.
                This tool helps you identify potential concerns and improve your online presence.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="social-profile">Enter Social Media Handle or URL</Label>
              <div className="flex gap-2">
                <Input
                  id="social-profile"
                  placeholder="@username or profile URL"
                  value={socialMediaProfile}
                  onChange={(e) => setSocialMediaProfile(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={scanProfile} 
                  disabled={isScanning || !socialMediaProfile}
                >
                  {isScanning ? 'Scanning...' : 'Scan Profile'}
                </Button>
              </div>
            </div>
            
            {profileScoreResult && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Reputation Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0 text-center">
                      <span className={`text-2xl font-bold ${
                        profileScoreResult.score >= 80 ? 'text-green-500' :
                        profileScoreResult.score >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {profileScoreResult.score}/100
                      </span>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Flagged Content</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0 text-center">
                      <span className={`text-2xl font-bold ${
                        profileScoreResult.flaggedItems === 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {profileScoreResult.flaggedItems || 0}
                      </span>
                    </CardContent>
                  </Card>
                  
                  <Card className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0 text-center">
                      <span className={`font-medium ${
                        profileScoreResult.score >= 80 ? 'text-green-500' :
                        profileScoreResult.score >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {profileScoreResult.score >= 80 ? 'Excellent' :
                         profileScoreResult.score >= 60 ? 'Needs Improvement' : 'Needs Attention'}
                      </span>
                    </CardContent>
                  </Card>
                </div>
                
                {profileScoreResult.issues && profileScoreResult.issues.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Issues Found:</h3>
                    <ul className="text-sm space-y-1">
                      {profileScoreResult.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {profileScoreResult.recommendations && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Recommendations:</h3>
                    <ul className="text-sm space-y-1">
                      {profileScoreResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render shareable tools tab
  const renderShareTools = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Athlete Cards & Share Tools</CardTitle>
            <CardDescription>
              Create shareable graphics and profiles for coaches and recruiters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Customize Athlete Card</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-personal" 
                    checked={showPersonalInfo} 
                    onCheckedChange={setShowPersonalInfo} 
                  />
                  <Label htmlFor="show-personal">Personal Info</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-stats" 
                    checked={showStats} 
                    onCheckedChange={setShowStats} 
                  />
                  <Label htmlFor="show-stats">Stats & Metrics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-academics" 
                    checked={showAcademics} 
                    onCheckedChange={setShowAcademics} 
                  />
                  <Label htmlFor="show-academics">Academic Info</Label>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div 
                id="athlete-card" 
                className="bg-white p-6 rounded-lg border shadow-sm max-w-md mx-auto"
                style={{ minHeight: '400px' }}
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">{athlete?.firstName} {athlete?.lastName}</h2>
                  <p className="text-muted-foreground">{athlete?.position}</p>
                </div>
                
                {showPersonalInfo && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Personal Info</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">School:</span>
                        <p>{athlete?.school || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Grad Year:</span>
                        <p>{athlete?.graduationYear || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Height:</span>
                        <p>{athlete?.height ? `${Math.floor(athlete.height / 12)}'${athlete.height % 12}"` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <p>{athlete?.weight ? `${athlete.weight} lbs` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {showStats && metricsData && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {metricsData.fortyYard && (
                        <div>
                          <span className="text-muted-foreground">40-Yard:</span>
                          <p>{metricsData.fortyYard}s</p>
                        </div>
                      )}
                      {metricsData.verticalJump && (
                        <div>
                          <span className="text-muted-foreground">Vertical:</span>
                          <p>{metricsData.verticalJump}"</p>
                        </div>
                      )}
                      {metricsData.benchPress && (
                        <div>
                          <span className="text-muted-foreground">Bench:</span>
                          <p>{metricsData.benchPress} lbs</p>
                        </div>
                      )}
                      {metricsData.squatMax && (
                        <div>
                          <span className="text-muted-foreground">Squat:</span>
                          <p>{metricsData.squatMax} lbs</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {showAcademics && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Academic Profile</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">GPA:</span>
                        <p>{athlete?.gpa || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ACT:</span>
                        <p>{athlete?.actScore || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {generatedBio && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Athlete Bio</h3>
                    <p className="text-sm">{generatedBio}</p>
                  </div>
                )}
                
                <div className="text-center text-xs text-muted-foreground mt-4">
                  <p>GridIron LegacyAI Profile Card</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={generateAthleteCard}>
                <Download className="h-4 w-4 mr-2" />
                Download Athlete Card
              </Button>
              <Button variant="outline" onClick={generatePdfProfile}>
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Profile
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Share Options</Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Twitter className="h-4 w-4 mr-2" />
                  <span>Twitter</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Instagram className="h-4 w-4 mr-2" />
                  <span>Instagram</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Facebook className="h-4 w-4 mr-2" />
                  <span>Facebook</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Direct Link</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render media press tab
  const renderMediaPress = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Press & Media Section</CardTitle>
            <CardDescription>
              Collect and showcase media coverage, interviews, and press mentions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertTitle className="text-amber-700">Coming Soon</AlertTitle>
              <AlertDescription className="text-amber-700">
                The full Press & Media section is under development. Basic functionality is available now.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="media-url">Add Media Link</Label>
              <div className="flex gap-2">
                <Input
                  id="media-url"
                  placeholder="Paste article URL, video link, etc."
                  className="flex-1"
                />
                <Button>Add Link</Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                Add links to news articles, interviews, or any media where you've been mentioned
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>Your Media Collection</Label>
              <div className="border rounded-md p-4 text-center text-muted-foreground">
                <p>No media links added yet.</p>
                <p className="text-sm">Add your first media link using the form above.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoadingAthlete) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Player Branding Toolkit</h1>
        <div className="text-center py-8">Loading athlete profile...</div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Player Branding Toolkit</h1>
        <Card>
          <CardHeader>
            <CardTitle>Athlete Profile Required</CardTitle>
            <CardDescription>
              You need to complete your athlete profile to use the branding toolkit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Complete your athlete profile to unlock branding tools.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/profile'}>
              Go to Profile Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-2">Player Branding Toolkit</h1>
      <p className="text-muted-foreground mb-6">
        Build and improve your personal brand for recruiting and NIL opportunities
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="bio-generator">
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            Bio Generator
          </TabsTrigger>
          <TabsTrigger value="social-templates">
            <Instagram className="h-4 w-4 mr-2 hidden md:inline" />
            Social Templates
          </TabsTrigger>
          <TabsTrigger value="profile-scanner">
            <Filter className="h-4 w-4 mr-2 hidden md:inline" />
            Profile Scanner
          </TabsTrigger>
          <TabsTrigger value="share-tools">
            <Share className="h-4 w-4 mr-2 hidden md:inline" />
            Share Tools
          </TabsTrigger>
          <TabsTrigger value="media-press">
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            Press & Media
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bio-generator" className="mt-6">
          {renderBioGenerator()}
        </TabsContent>
        
        <TabsContent value="social-templates" className="mt-6">
          {renderSocialTemplates()}
        </TabsContent>
        
        <TabsContent value="profile-scanner" className="mt-6">
          {renderProfileScanner()}
        </TabsContent>
        
        <TabsContent value="share-tools" className="mt-6">
          {renderShareTools()}
        </TabsContent>
        
        <TabsContent value="media-press" className="mt-6">
          {renderMediaPress()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerBrandingToolkitPage;