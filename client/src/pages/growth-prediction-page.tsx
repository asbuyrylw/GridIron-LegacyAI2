import { HeightPredictor } from "@/components/growth/height-predictor";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

export default function GrowthPredictionPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  return (
    <div className="container py-6 max-w-7xl">
      <Helmet>
        <title>Growth Prediction | GridIron Legacy</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Growth Prediction</h1>
        <p className="text-muted-foreground mb-4">
          Use our advanced Khamis-Roche method calculator to predict your adult height
          and find the football positions that might be best suited for you.
        </p>
        
        {!isAuthenticated && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-1">Create an account to save your predictions</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Sign up or log in to save your growth predictions and track your progress over time.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="default" size="sm">
                <Link href="/auth?tab=login">Log In</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth?tab=register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HeightPredictor />
          </div>
          
          <div className="p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-bold mb-4">About Height Prediction</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-1">The Khamis-Roche Method</h3>
                <p>
                  The Khamis-Roche method is currently considered one of the most accurate 
                  non-radiographic height prediction methods. It uses your current height, 
                  weight, gender, age, and parents' heights to calculate your predicted adult height.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Position Recommendations</h3>
                <p>
                  Based on your predicted adult height, we'll suggest football positions that
                  typically align with your physical attributes. While height is just one 
                  factor in determining your ideal position, it can provide useful guidance.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Growth Tracking</h3>
                <p>
                  By regularly updating your measurements, you can track your growth 
                  progress and see how you're trending toward your predicted adult height.
                  This can help you make informed decisions about your athletic development.
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground pt-2">
                <p>
                  Note: This prediction method is based on statistical models and provides
                  an estimate, not a guaranteed outcome. Individual factors like nutrition,
                  activity level, and genetic variations can influence your actual growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-secondary/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Nutrition & Growth</h3>
          <p className="text-sm mb-4">
            Proper nutrition plays a crucial role in reaching your full height potential.
            Ensure you're getting adequate protein, calcium, and vitamins D and A.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/nutrition">View Nutrition Plans</Link>
          </Button>
        </div>
        
        <div className="bg-secondary/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Position Analysis</h3>
          <p className="text-sm mb-4">
            Different positions have different optimal physical profiles. Explore the
            requirements for each position to find where you might excel.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/training">Training Resources</Link>
          </Button>
        </div>
        
        <div className="bg-secondary/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">College Recruiting</h3>
          <p className="text-sm mb-4">
            Colleges scout for specific physical attributes based on position. Use your
            height prediction to find colleges that recruit players with your profile.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/college-matcher">College Matcher</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}