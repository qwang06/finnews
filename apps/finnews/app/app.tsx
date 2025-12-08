import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

interface TickerResponse {
  ticker: string;
  message: string;
  news_summary?: string;
  status: string;
}

export function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TickerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:8725/api/ticker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to fetch ticker data');
      }

      const data: TickerResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Analyzing...' : 'Submit'}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {response && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-md space-y-2">
              <div className="font-semibold text-lg">{response.ticker}</div>
              <p className="text-sm text-muted-foreground">
                {response.message}
              </p>
              {response.news_summary && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">{response.news_summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
