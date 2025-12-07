import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

export function App() {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticker submitted:', ticker);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">FinNews</h1>
            <p className="text-muted-foreground">
              Enter a ticker symbol to get started
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ticket">Ticker</Label>
              <Input
                id="ticket"
                type="text"
                placeholder="e.g., AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
